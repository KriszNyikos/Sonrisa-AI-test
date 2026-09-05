#!/bin/sh
# Initialize SQLite database and keep container running
sqlite3 /data/alerts.db "SELECT 1" 2>/dev/null
# Keep the container alive
tail -f /dev/null

