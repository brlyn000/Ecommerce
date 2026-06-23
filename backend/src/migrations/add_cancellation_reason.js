const db = require('../config/database');
const logger = require('../utils/logger');

const addCancellationReason = async () => {
  try {
    const [columns] = await db.execute(`SHOW COLUMNS FROM order_items LIKE 'cancellation_reason'`);
    if (columns.length === 0) {
      await db.execute(`ALTER TABLE order_items ADD COLUMN cancellation_reason TEXT DEFAULT NULL`);
      logger.info('Migration: cancellation_reason column added to order_items');
    }
  } catch (error) {
    logger.error('Migration add_cancellation_reason error:', error.message);
  }
};

module.exports = { addCancellationReason };
