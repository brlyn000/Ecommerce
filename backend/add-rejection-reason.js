const mysql = require('mysql2/promise');
require('dotenv').config();

async function addRejectionReasonColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  });

  try {
    // Add rejection_reason column to orders table
    await connection.execute(`
      ALTER TABLE orders 
      ADD COLUMN rejection_reason TEXT NULL AFTER status
    `);
    
    console.log('Successfully added rejection_reason column to orders table');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('rejection_reason column already exists');
    } else {
      console.error('Error adding rejection_reason column:', error);
    }
  } finally {
    await connection.end();
  }
}

addRejectionReasonColumn();