const db = require('./src/config/database');

async function fixOrderIdColumn() {
  try {
    console.log('🔧 Fixing order_id column type...');
    
    // Change order_id from INT to VARCHAR to support string IDs
    await db.execute("ALTER TABLE notifications MODIFY COLUMN order_id VARCHAR(50) NULL");
    
    console.log('✅ order_id column changed to VARCHAR(50)');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

fixOrderIdColumn();