#!/bin/bash

echo "=== Testing PostgreSQL Replication ==="
echo "======================================"

# Test 1: Insert data on master
echo "1. Inserting test data on master..."
docker exec -e PGPASSWORD=admin123 postgres-1 psql -U admin -d mydb -c "
INSERT INTO test_replication (data) VALUES 
('Test data 1'),
('Test data 2'),
('Test data 3');
"

sleep 2

# Test 2: Check data on replicas
echo ""
echo "2. Checking data on replica 1 (postgres-2)..."
docker exec -e PGPASSWORD=admin123 postgres-2 psql -U admin -d mydb -c "SELECT * FROM test_replication;"

echo ""
echo "3. Checking data on replica 2 (postgres-3)..."
docker exec -e PGPASSWORD=admin123 postgres-3 psql -U admin -d mydb -c "SELECT * FROM test_replication;"

# Test 3: Check replication status
echo ""
echo "4. Checking replication status on master (postgres-1)..."
docker exec -e PGPASSWORD=admin123 postgres-1 psql -U admin -d mydb -c "
SELECT 
    application_name,
    client_addr,
    state,
    sync_state,
    replay_lag
FROM pg_stat_replication;
"

# Test 4: Test write through HAProxy
echo ""
echo "5. Testing write through HAProxy (port 5000)..."
if command -v psql &> /dev/null; then
    PGPASSWORD=admin123 psql -h localhost -p 5000 -U admin -d mydb -c "
    INSERT INTO test_replication (data) VALUES ('Test via HAProxy');
    "
else
    echo "Host psql not found, routing test query through Docker network (postgres-1 -> haproxy:5000)..."
    docker exec -e PGPASSWORD=admin123 postgres-1 psql -h haproxy -p 5000 -U admin -d mydb -c "
    INSERT INTO test_replication (data) VALUES ('Test via HAProxy');
    "
fi

# Test 5: Read through HAProxy
echo ""
echo "6. Testing read through HAProxy (port 5001)..."
if command -v psql &> /dev/null; then
    PGPASSWORD=admin123 psql -h localhost -p 5001 -U admin -d mydb -c "SELECT * FROM test_replication;"
else
    echo "Host psql not found, routing test query through Docker network (postgres-1 -> haproxy:5001)..."
    docker exec -e PGPASSWORD=admin123 postgres-1 psql -h haproxy -p 5001 -U admin -d mydb -c "SELECT * FROM test_replication;"
fi

echo ""
echo "=== Test Complete! ==="
