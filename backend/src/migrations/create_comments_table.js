const db = require('../config/database');

async function createCommentsTable() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        comment TEXT NOT NULL,
        rating INT DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product_id (product_id)
      )
    `);
    console.log('Comments table created successfully');
  } catch (error) {
    console.error('Error creating comments table:', error);
  }
}

module.exports = { createCommentsTable };