const mysql = require('mysql2/promise');
require('dotenv').config();

async function addContactInfoColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  });

  try {
    // Add contact_info column to users table
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS contact_info JSON NULL
    `);
    
    console.log('✅ Successfully added contact_info column to users table');
    
  } catch (error) {
    console.error('❌ Error adding contact_info column:', error);
  } finally {
    await connection.end();
  }
}

addContactInfoColumn();