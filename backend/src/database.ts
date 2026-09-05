import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/alerts.db';

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function initializeDatabase(): Promise<void> {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  console.log('🔧 Initializing database...');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      keywords TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notification_channels (
      id TEXT PRIMARY KEY,
      alert_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('email', 'slack')),
      destination TEXT NOT NULL,
      is_enabled BOOLEAN DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY(alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
      UNIQUE(alert_id, type, destination)
    );

    CREATE TABLE IF NOT EXISTS news_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('breaking_news', 'market', 'disaster', 'other')),
      source TEXT,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notification_logs (
      id TEXT PRIMARY KEY,
      alert_id TEXT NOT NULL,
      news_item_id TEXT NOT NULL,
      channel_type TEXT NOT NULL CHECK(channel_type IN ('email', 'slack')),
      destination TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('sent', 'failed', 'pending')),
      error_message TEXT,
      sent_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(alert_id) REFERENCES alerts(id),
      FOREIGN KEY(news_item_id) REFERENCES news_items(id)
    );

    CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
    CREATE INDEX IF NOT EXISTS idx_channels_alert ON notification_channels(alert_id);
    CREATE INDEX IF NOT EXISTS idx_news_category ON news_items(category);
    CREATE INDEX IF NOT EXISTS idx_logs_alert ON notification_logs(alert_id);
    CREATE INDEX IF NOT EXISTS idx_logs_status ON notification_logs(status);
  `);

  console.log('✅ Database initialized successfully');
  console.log(`📍 Database location: ${DB_PATH}`);

  await db.close();
}

// Run initialization
initializeDatabase().catch((err) => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});
