const db = require('../config/database');
const logger = require('../utils/logger');

async function addGoogleIdToUsers() {
  try {
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'google_id'
    `);
    if (columns.length === 0) {
      await db.execute(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL`);
      logger.info('Migration: google_id column added to users table.');
    }
  } catch (error) {
    logger.error('Migration add_google_id error:', error.message);
  }
}

module.exports = { addGoogleIdToUsers };
