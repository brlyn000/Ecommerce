const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixOrdersTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db'
  });

  try {
    // Check if orders table exists
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'orders'
    `);
    
    if (tables.length === 0) {
      // Create orders table
      await connection.execute(`
        CREATE TABLE orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id VARCHAR(255) UNIQUE NOT NULL,
          user_id INT NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          status ENUM('pending', 'accepted', 'completed', 'rejected', 'confirmed') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Orders table created');
    } else {
      console.log('Orders table already exists');
    }
    
    // Check if order_items table exists
    const [itemTables] = await connection.execute(`
      SHOW TABLES LIKE 'order_items'
    `);
    
    if (itemTables.length === 0) {
      // Create order_items table
      await connection.execute(`
        CREATE TABLE order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id VARCHAR(255) NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Order_items table created');
    } else {
      console.log('Order_items table already exists');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixOrdersTable();