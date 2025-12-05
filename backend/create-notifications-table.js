const mysql = require('mysql2/promise');
require('dotenv').config();

async function createNotificationsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  });

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('like', 'checkout') NOT NULL,
        tenant_id INT NOT NULL,
        user_id INT NOT NULL,
        product_id INT,
        order_id VARCHAR(255),
        message TEXT NOT NULL,
        data JSON,
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tenant_id (tenant_id),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `);
    
    console.log('Notifications table created successfully');
  } catch (error) {
    console.error('Error creating notifications table:', error);
  } finally {
    await connection.end();
  }
}

createNotificationsTable();