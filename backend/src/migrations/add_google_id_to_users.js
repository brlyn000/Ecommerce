const db = require('../config/database');

async function addGoogleIdToUsers() {
  try {
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'google_id'
    `);

    if (columns.length > 0) {
      console.log('Column google_id already exists, skipping.');
      return;
    }

    await db.execute(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL`);
    console.log('Migration success: google_id column added to users table.');
  } catch (error) {
    console.error('Migration failed:', error.message);
  }
}

addGoogleIdToUsers().then(() => process.exit(0));
