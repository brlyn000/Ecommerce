const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixStatusEnum() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  });

  try {
    // Modify status column to include all needed values
    await connection.execute(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('pending', 'accepted', 'completed', 'rejected', 'confirmed', 'disputed') DEFAULT 'pending'
    `);
    
    console.log('Status column updated successfully');
  } catch (error) {
    console.error('Error updating status column:', error);
  } finally {
    await connection.end();
  }
}

fixStatusEnum();