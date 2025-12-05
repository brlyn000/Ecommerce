const mysql = require('mysql2/promise');
require('dotenv').config();

async function createLikesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'e-commerce'
  });

  try {
    // Create likes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_likes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        user_session VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_like (product_id, user_session)
      )
    `);

    // Add likes_count column to products table
    await connection.execute(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0
    `);

    console.log('Likes table created successfully!');
  } catch (error) {
    console.error('Error creating likes table:', error);
  } finally {
    await connection.end();
  }
}

createLikesTable();