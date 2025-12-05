const db = require('./src/config/database');

async function updateCommentsSchema() {
  try {
    // Add new columns to comments table
    await db.execute(`
      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS comment_type ENUM('review', 'comment') DEFAULT 'comment',
      ADD COLUMN IF NOT EXISTS user_id INT NULL,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE
    `);
    
    console.log('Comments table updated successfully');
  } catch (error) {
    console.error('Error updating comments table:', error);
  }
}

updateCommentsSchema();