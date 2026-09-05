/**
 * Database connection manager
 */

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { createLogger } from './logger';

const logger = createLogger('DatabaseManager');

let dbInstance: Database | null = null;

const DB_PATH = process.env.DATABASE_PATH || './data/alerts.db';

/**
 * Ensures the data directory exists
 */
function ensureDataDirectory(): void {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    logger.info(`Created data directory: ${dataDir}`);
  }
}

/**
 * Initializes the database connection
 */
export async function initializeDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  ensureDataDirectory();

  try {
    dbInstance = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    logger.info('Database connection established', { path: DB_PATH });
    return dbInstance;
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  }
}

/**
 * Gets the current database instance
 */
export function getDatabase(): Database {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

/**
 * Closes the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    logger.info('Database connection closed');
  }
}

/**
 * Performs a database transaction
 */
export async function executeTransaction<T>(
  callback: (db: Database) => Promise<T>,
): Promise<T> {
  const db = getDatabase();
  try {
    await db.exec('BEGIN TRANSACTION');
    const result = await callback(db);
    await db.exec('COMMIT');
    return result;
  } catch (error) {
    await db.exec('ROLLBACK');
    logger.error('Transaction failed, rolled back', error);
    throw error;
  }
}

/**
 * Checks if database is connected and healthy
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const db = getDatabase();
    await db.get('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed', error);
    return false;
  }
}
