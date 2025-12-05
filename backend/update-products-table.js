const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateProductsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'e-commerce'
  });

  try {
    await connection.execute(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS created_by INT,
      ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    `);

    console.log('Products table updated successfully!');
  } catch (error) {
    console.error('Error updating products table:', error);
  } finally {
    await connection.end();
  }
}

updateProductsTable();