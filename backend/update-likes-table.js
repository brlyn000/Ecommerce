const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateLikesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'e-commerce'
  });

  try {
    // Drop existing table and recreate with user_id
    await connection.execute('DROP TABLE IF EXISTS product_likes');
    
    await connection.execute(`
      CREATE TABLE product_likes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_like (product_id, user_id)
      )
    `);

    console.log('Likes table updated successfully!');
  } catch (error) {
    console.error('Error updating likes table:', error);
  } finally {
    await connection.end();
  }
}

updateLikesTable();