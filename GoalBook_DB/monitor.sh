#!/bin/bash

echo "=== PostgreSQL Cluster Monitoring ==="
echo "======================================"
echo ""

# Check container status
echo "Container Status:"
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo ""
echo "Master Status (postgres-1):"
docker exec postgres-1 pg_isready -U admin -d mydb

echo ""
echo "Replica 1 Status (postgres-2):"
docker exec postgres-2 pg_isready -U admin -d mydb

echo ""
echo "Replica 2 Status (postgres-3):"
docker exec postgres-3 pg_isready -U admin -d mydb

echo ""
echo "Replication Details:"
docker exec -e PGPASSWORD=admin123 postgres-1 psql -U admin -d mydb -c "
SELECT 
    application_name,
    client_addr,
    state,
    sync_state,
    pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) as lag_bytes,
    replay_lag
FROM pg_stat_replication;
"

echo ""
echo "Recent Queries:"
docker exec -e PGPASSWORD=admin123 postgres-1 psql -U admin -d mydb -c "
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE state = 'active'
LIMIT 10;
"
