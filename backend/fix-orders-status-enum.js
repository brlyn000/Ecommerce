const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixOrdersStatusEnum() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  });

  try {
    // Update orders table status enum to include 'mixed'
    await connection.execute(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('pending', 'accepted', 'completed', 'confirmed', 'rejected', 'disputed', 'mixed') DEFAULT 'pending'
    `);
    
    console.log('✅ Successfully updated orders status enum to include "mixed"');
    
  } catch (error) {
    console.error('❌ Error updating orders status enum:', error);
  } finally {
    await connection.end();
  }
}

fixOrdersStatusEnum();