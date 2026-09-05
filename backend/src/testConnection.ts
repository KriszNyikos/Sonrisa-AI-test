import { initializeDatabase, getDatabase, checkDatabaseHealth, closeDatabase } from './utils';
import { createLogger } from './utils';

const logger = createLogger('DBConnection');

async function testDatabaseConnection() {
  try {
    logger.info('🔍 Testing database connection...');

    // Initialize database
    logger.info('Initializing database...');
    await initializeDatabase();

    // Get database instance
    const db = getDatabase();
    logger.info('✅ Database instance obtained');

    // Check health
    const isHealthy = await checkDatabaseHealth();
    logger.info(`✅ Database health check: ${isHealthy ? 'HEALTHY' : 'FAILED'}`);

    // Get table info
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    logger.info('📊 Database tables:');
    tables.forEach((table: any) => {
      logger.info(`  - ${table.name}`);
    });

    // Count records
    logger.info('📈 Record counts:');
    for (const table of tables) {
      const result = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
      logger.info(`  ${table.name}: ${result?.count || 0} records`);
    }

    // List indexes
    const indexes = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    if (indexes.length > 0) {
      logger.info('🔑 Database indexes:');
      indexes.forEach((idx: any) => {
        logger.info(`  - ${idx.name}`);
      });
    }

    logger.info('✅ Database connection test PASSED');

    // Close connection
    await closeDatabase();
    logger.info('Closed database connection');
  } catch (error) {
    logger.error('❌ Database connection test FAILED', error);
    process.exit(1);
  }
}

testDatabaseConnection();
