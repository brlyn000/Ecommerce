const db = require('./src/config/database');

async function checkNotificationsTable() {
  try {
    console.log('🔍 Checking notifications table structure...\n');

    // Check table structure
    const [columns] = await db.execute("DESCRIBE notifications");
    console.log('📋 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Check if table has data
    const [count] = await db.execute("SELECT COUNT(*) as total FROM notifications");
    console.log(`\n📊 Total notifications: ${count[0].total}`);

    // Show recent notifications
    const [recent] = await db.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5");
    console.log('\n📝 Recent notifications:');
    recent.forEach(notif => {
      console.log(`  - ID: ${notif.id}, Type: ${notif.type}, Tenant: ${notif.tenant_id}, Message: ${notif.message}`);
    });

    // Check if is_read column exists
    const hasIsRead = columns.some(col => col.Field === 'is_read');
    if (!hasIsRead) {
      console.log('\n⚠️  Missing is_read column, adding it...');
      await db.execute("ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE");
      console.log('✅ Added is_read column');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkNotificationsTable();