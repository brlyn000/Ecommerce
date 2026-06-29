const db = require('../config/database');

const createPasswordResetTokensTable = async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Password reset tokens table ready');
  } catch (error) {
    console.error('Error creating password_reset_tokens table:', error);
  }
};

module.exports = { createPasswordResetTokensTable };
