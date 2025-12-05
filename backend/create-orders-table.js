const mysql = require('mysql2/promise');
require('dotenv').config();

async function createOrdersTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  });

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(255) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_order_id (order_id)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        INDEX idx_order_id (order_id),
        INDEX idx_product_id (product_id)
      )
    `);
    
    console.log('Orders tables created successfully');
  } catch (error) {
    console.error('Error creating orders tables:', error);
  } finally {
    await connection.end();
  }
}

createOrdersTables();