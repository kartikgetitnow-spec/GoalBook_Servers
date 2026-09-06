#!/bin/bash
set -euo pipefail

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MASTER_HOST="postgres-1"
DB_USER="admin"
DB_NAME="production_db"

# Create backup directory
mkdir -p "${BACKUP_DIR}/${TIMESTAMP}"

# Full backup
echo "Starting full backup..."
docker exec ${MASTER_HOST} pg_basebackup \
    -h localhost \
    -U ${DB_USER} \
    -D "${BACKUP_DIR}/${TIMESTAMP}/base" \
    -Ft -z -P \
    -X stream

# Backup WAL files
echo "Archiving WAL files..."
docker exec ${MASTER_HOST} pg_archivecleanup \
    "${BACKUP_DIR}/${TIMESTAMP}/wal" \
    $(docker exec ${MASTER_HOST} psql -U ${DB_USER} -t -c "SELECT pg_walfile_name(pg_current_wal_lsn());")

# Backup configuration
docker exec ${MASTER_HOST} pg_dumpall \
    -U ${DB_USER} \
    --globals-only \
    > "${BACKUP_DIR}/${TIMESTAMP}/globals.sql"

# Create manifest
echo "Creating backup manifest..."
cat > "${BACKUP_DIR}/${TIMESTAMP}/manifest.json" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "type": "full",
    "master": "${MASTER_HOST}",
    "database": "${DB_NAME}",
    "files": [
        "base.tar.gz",
        "globals.sql"
    ]
}
EOF

# Cleanup old backups
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -maxdepth 1 -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} \;

echo "Backup completed successfully!"
