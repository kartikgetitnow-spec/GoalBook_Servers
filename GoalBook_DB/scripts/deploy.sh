#!/bin/bash
set -euo pipefail

# Load environment variables
source .env

echo "=== Deploying PostgreSQL HA Cluster ==="

# Create required directories
mkdir -p configs/{postgres,patroni,haproxy,pgbouncer,prometheus,grafana}
mkdir -p backups logs

# Initialize Docker Swarm (for production)
docker swarm init --advertise-addr $(hostname -I | awk '{print $1}') || true

# Deploy stack
echo "Deploying stack..."
docker stack deploy -c docker-compose.yml postgres-ha

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Initialize Patroni cluster
echo "Initializing Patroni cluster..."
docker exec $(docker ps -q -f name=postgres-ha_postgres-1) \
    patronictl list

# Create replication slots
echo "Creating replication slots..."
docker exec $(docker ps -q -f name=postgres-ha_postgres-1) \
    psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "
SELECT * FROM pg_create_physical_replication_slot('replica_1');
SELECT * FROM pg_create_physical_replication_slot('replica_2');
"

# Setup cron jobs for backup
echo "Setting up backup cron job..."
echo "0 2 * * * /scripts/backup.sh" | crontab -

# Setup monitoring
echo "Configuring monitoring..."
curl -X POST http://localhost:3000/api/datasources \
    -H "Content-Type: application/json" \
    -d '{"name":"Prometheus","type":"prometheus","url":"http://prometheus:9090","access":"proxy"}'

echo "=== Deployment Complete ==="
echo "Master (Writes): localhost:5000"
echo "Replicas (Reads): localhost:5001"
echo "PgBouncer (Pooled): localhost:6432"
echo "HAProxy Stats: http://localhost:8404/stats"
echo "Grafana: http://localhost:3000"
echo "Prometheus: http://localhost:9090"
