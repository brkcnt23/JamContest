#!/bin/bash
# Database backup script — run via cron daily
# Usage: ./scripts/backup-db.sh
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-contest_db}"
DB_USER="${DB_USER:-contest}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

PGPASSWORD="${DB_PASSWORD:-contest}" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-acl \
  | gzip > "$BACKUP_FILE"

echo "Backup created: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Rotate old backups
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime "+$RETENTION_DAYS" -delete

echo "Cleanup: deleted backups older than $RETENTION_DAYS days"
echo "Current backups: $(ls -1 "$BACKUP_DIR" | wc -l) files"
