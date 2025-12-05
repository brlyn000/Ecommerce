const db = require('../config/database');

const createNotificationsTable = async () => {
  try {
    // Drop table if exists to recreate with correct structure
    await db.execute('DROP TABLE IF EXISTS notifications');
    
    const createTableQuery = `
      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('comment', 'checkout', 'order', 'like', 'review') NOT NULL,
        tenant_id INT NOT NULL,
        product_id INT NULL,
        order_id VARCHAR(50) NULL,
        message TEXT NOT NULL,
        data JSON NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tenant_id (tenant_id),
        INDEX idx_product_id (product_id),
        INDEX idx_created_at (created_at)
      )
    `;
    
    await db.execute(createTableQuery);
    console.log('Notifications table created successfully');
  } catch (error) {
    console.error('Error creating notifications table:', error);
  }
};

module.exports = { createNotificationsTable };