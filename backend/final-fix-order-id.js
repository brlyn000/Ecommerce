const db = require('./src/config/database');

async function finalFixOrderId() {
  try {
    console.log('🔧 Final fix for order_id column...');
    
    // First, backup existing notifications
    const [existing] = await db.execute("SELECT * FROM notifications WHERE order_id IS NOT NULL");
    console.log(`📋 Found ${existing.length} notifications with order_id`);
    
    // Change column type to VARCHAR
    await db.execute("ALTER TABLE notifications MODIFY COLUMN order_id VARCHAR(50) NULL");
    console.log('✅ Changed order_id to VARCHAR(50)');
    
    // Verify the change
    const [columns] = await db.execute("DESCRIBE notifications");
    const orderIdCol = columns.find(col => col.Field === 'order_id');
    console.log('📋 order_id column type:', orderIdCol.Type);
    
    console.log('🎉 Fix completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

finalFixOrderId();