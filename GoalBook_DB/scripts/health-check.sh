#!/bin/bash
set -euo pipefail

# Configuration
MASTER_HEALTH_URL="http://postgres-1:8008/health"
REPLICA1_HEALTH_URL="http://postgres-2:8008/health"
REPLICA2_HEALTH_URL="http://postgres-3:8008/health"
ALERT_WEBHOOK="https://your-alert-webhook.com/notify"

# Check cluster health
check_node() {
    local url=$1
    local node=$2
    local role=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "${url}")
    
    if [ "${response}" != "200" ]; then
        echo "ERROR: ${node} (${role}) is unhealthy"
        send_alert "CRITICAL" "${node} (${role}) is down"
        return 1
    fi
    
    # Check if it's master
    if [ "${role}" == "master" ]; then
        master_response=$(curl -s "${url}" | grep -c '"role":"master"')
        if [ "${master_response}" != "1" ]; then
            echo "WARNING: ${node} is not master anymore"
            send_alert "WARNING" "${node} lost master role"
        fi
    fi
    
    echo "OK: ${node} (${role}) is healthy"
    return 0
}

send_alert() {
    local severity=$1
    local message=$2
    
    curl -X POST "${ALERT_WEBHOOK}" \
        -H "Content-Type: application/json" \
        -d "{\"severity\":\"${severity}\",\"message\":\"${message}\",\"timestamp\":\"$(date -Iseconds)\"}"
}

# Main check
echo "=== PostgreSQL Cluster Health Check $(date) ==="
check_node "${MASTER_HEALTH_URL}" "postgres-1" "master"
check_node "${REPLICA1_HEALTH_URL}" "postgres-2" "replica"
check_node "${REPLICA2_HEALTH_URL}" "postgres-3" "replica"

# Check replication lag
docker exec postgres-1 psql -U admin -d production_db -c "
SELECT 
    application_name,
    client_addr,
    state,
    sync_state,
    pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) as lag_bytes,
    replay_lag
FROM pg_stat_replication;
"
