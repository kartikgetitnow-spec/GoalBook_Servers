#!/bin/bash
set -e

echo "=== PostgreSQL HA Cluster Setup ==="
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "Please log out and log back in to use Docker without sudo"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    if docker compose version &> /dev/null; then
        docker-compose() {
            docker compose "$@"
        }
    else
        echo "Docker Compose is not installed. Installing..."
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
fi

# Create necessary directories
echo "Creating directory structure..."
mkdir -p configs/{patroni,haproxy,pgbouncer,prometheus,grafana}
mkdir -p configs/grafana/provisioning/datasources configs/grafana/provisioning/dashboards
mkdir -p scripts backups logs

# Provision Grafana Prometheus datasource
cat > configs/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

# Start the cluster
echo "Starting the cluster..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

# Wait for PostgreSQL master server to accept connections
echo "Waiting for PostgreSQL master (postgres-1) to be ready..."
RETRIES=40
until docker exec -e PGPASSWORD=admin123 postgres-1 psql -U admin -d postgres -c "SELECT 1;" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo "Waiting for postgres-1... ($RETRIES retries remaining)"
    RETRIES=$((RETRIES - 1))
    sleep 2
done

if [ $RETRIES -eq 0 ]; then
    echo "ERROR: postgres-1 failed to become ready in time. Recent container logs:"
    docker logs --tail 30 postgres-1
    exit 1
fi

echo "postgres-1 is up and accepting connections."

# Ensure database 'mydb' exists
echo "Ensuring database 'mydb' exists..."
if ! docker exec -e PGPASSWORD=admin123 -e PGOPTIONS="-c synchronous_commit=local" postgres-1 psql -U admin -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='mydb'" | grep -q 1; then
    echo "Creating database 'mydb'..."
    docker exec -e PGPASSWORD=admin123 -e PGOPTIONS="-c synchronous_commit=local" postgres-1 psql -U admin -d postgres -c "CREATE DATABASE mydb;"
fi

echo "Database 'mydb' is verified."

# Create replication user on master (idempotent)
echo "Configuring replication user..."
docker exec -e PGPASSWORD=admin123 -e PGOPTIONS="-c synchronous_commit=local" postgres-1 psql -U admin -d mydb -c "
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'replicator') THEN
    CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator123';
  ELSE
    ALTER USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator123';
  END IF;
END
\$\$;
GRANT ALL PRIVILEGES ON DATABASE mydb TO replicator;
"

# Create test table
echo "Creating test table..."
docker exec -e PGPASSWORD=admin123 -e PGOPTIONS="-c synchronous_commit=local" postgres-1 psql -U admin -d mydb -c "
CREATE TABLE IF NOT EXISTS test_replication (
    id SERIAL PRIMARY KEY,
    data TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
"

# Setup replication on replica 1 (postgres-2)
echo "Setting up replication on postgres-2..."
docker exec postgres-2 sh -c "
rm -rf /tmp/basebackup
PGPASSWORD=replicator123 pg_basebackup -h postgres-1 -p 5432 -U replicator -D /tmp/basebackup -Fp -Xs -P -R
find /var/lib/postgresql/data -mindepth 1 -delete 2>/dev/null || rm -rf /var/lib/postgresql/data/*
cp -a /tmp/basebackup/. /var/lib/postgresql/data/
rm -rf /tmp/basebackup
touch /var/lib/postgresql/data/standby.signal
echo \"primary_conninfo = 'host=postgres-1 port=5432 user=replicator password=replicator123 application_name=postgres-2'\" >> /var/lib/postgresql/data/postgresql.auto.conf
chown -R postgres:postgres /var/lib/postgresql/data
chmod 700 /var/lib/postgresql/data
"

# Setup replication on replica 2 (postgres-3)
echo "Setting up replication on postgres-3..."
docker exec postgres-3 sh -c "
rm -rf /tmp/basebackup
PGPASSWORD=replicator123 pg_basebackup -h postgres-1 -p 5432 -U replicator -D /tmp/basebackup -Fp -Xs -P -R
find /var/lib/postgresql/data -mindepth 1 -delete 2>/dev/null || rm -rf /var/lib/postgresql/data/*
cp -a /tmp/basebackup/. /var/lib/postgresql/data/
rm -rf /tmp/basebackup
touch /var/lib/postgresql/data/standby.signal
echo \"primary_conninfo = 'host=postgres-1 port=5432 user=replicator password=replicator123 application_name=postgres-3'\" >> /var/lib/postgresql/data/postgresql.auto.conf
chown -R postgres:postgres /var/lib/postgresql/data
chmod 700 /var/lib/postgresql/data
"

# Restart replicas to apply replication
echo "Restarting replicas..."
docker restart postgres-2 postgres-3

# Wait for replicas to be ready
echo "Waiting for replicas to start up..."
sleep 8

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Connection Details:"
echo "==================="
echo "Master (Writes):    localhost:5432"
echo "Replica 1 (Reads):  localhost:5433"
echo "Replica 2 (Reads):  localhost:5434"
echo "HAProxy Master:     localhost:5000"
echo "HAProxy Replica:    localhost:5001"
echo "PgBouncer:          localhost:6432"
echo ""
echo "Monitoring:"
echo "==========="
echo "HAProxy Stats:      http://localhost:8404/stats (admin/admin123)"
echo "Prometheus:         http://localhost:9090"
echo "Grafana:            http://localhost:3000 (admin/admin123)"
echo ""
echo "To test replication, run: ./test-replication.sh"
