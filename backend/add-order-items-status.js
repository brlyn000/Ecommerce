const mysql = require('mysql2/promise');
require('dotenv').config();

async function addOrderItemsStatus() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  });

  try {
    // Add status column to order_items if it doesn't exist
    await connection.execute(`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS status ENUM('pending', 'accepted', 'completed', 'confirmed', 'rejected', 'disputed') DEFAULT 'pending'
    `);
    
    // Add rejection_reason column to order_items if it doesn't exist
    await connection.execute(`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL
    `);
    
    // Update existing order_items to have same status as their parent order
    await connection.execute(`
      UPDATE order_items oi 
      JOIN orders o ON oi.order_id = o.order_id 
      SET oi.status = o.status 
      WHERE oi.status = 'pending'
    `);
    
    console.log('✅ Successfully added status and rejection_reason columns to order_items table');
    console.log('✅ Updated existing order items with parent order status');
    
  } catch (error) {
    console.error('❌ Error updating order_items table:', error);
  } finally {
    await connection.end();
  }
}

addOrderItemsStatus();