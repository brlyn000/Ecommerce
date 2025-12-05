const db = require('./src/config/database');

async function forceFixNotifications() {
  try {
    console.log('🔧 Force fixing notifications table...');
    
    // Drop and recreate order_id column
    await db.execute("ALTER TABLE notifications DROP COLUMN order_id");
    console.log('✅ Dropped order_id column');
    
    await db.execute("ALTER TABLE notifications ADD COLUMN order_id VARCHAR(50) NULL AFTER product_id");
    console.log('✅ Added order_id as VARCHAR(50)');
    
    // Verify the change
    const [columns] = await db.execute("DESCRIBE notifications");
    const orderIdCol = columns.find(col => col.Field === 'order_id');
    console.log('📋 order_id column type:', orderIdCol.Type);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

forceFixNotifications();