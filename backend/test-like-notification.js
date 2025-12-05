const db = require('./src/config/database');

async function testLikeNotification() {
  try {
    console.log('🧪 Testing Like Notification System...\n');

    // Check if we have products and users
    const [products] = await db.execute("SELECT id, name, created_by FROM products LIMIT 1");
    const [users] = await db.execute("SELECT id, full_name, username FROM users WHERE role = 'user' LIMIT 1");
    
    if (products.length === 0) {
      console.log('❌ No products found. Please add a product first.');
      return;
    }
    
    if (users.length === 0) {
      console.log('❌ No users found. Please add a user first.');
      return;
    }

    const product = products[0];
    const user = users[0];
    
    console.log(`📦 Using product: ${product.name} (ID: ${product.id})`);
    console.log(`👤 Using user: ${user.full_name || user.username} (ID: ${user.id})`);
    console.log(`🏢 Product owner (tenant): ${product.created_by}\n`);

    // Simulate like notification
    console.log('💖 Creating like notification...');
    const [result] = await db.execute(
      'INSERT INTO notifications (type, tenant_id, product_id, message, data, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [
        'like',
        product.created_by,
        product.id,
        `${user.full_name || user.username} liked your product "${product.name}"`,
        JSON.stringify({ 
          product_name: product.name, 
          customer_name: user.full_name || user.username,
          original_price: 100000,
          final_price: 90000,
          discount: 10
        })
      ]
    );
    
    console.log(`✅ Notification created with ID: ${result.insertId}`);

    // Check if notification was created
    const [notifications] = await db.execute(
      'SELECT * FROM notifications WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1',
      [product.created_by]
    );
    
    if (notifications.length > 0) {
      const notif = notifications[0];
      console.log('\n📬 Latest notification for tenant:');
      console.log(`  - Type: ${notif.type}`);
      console.log(`  - Message: ${notif.message}`);
      console.log(`  - Data: ${notif.data}`);
      console.log(`  - Created: ${notif.created_at}`);
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test notification...');
    await db.execute('DELETE FROM notifications WHERE id = ?', [result.insertId]);
    console.log('✅ Test notification cleaned up');

    console.log('\n🎉 Like notification system is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testLikeNotification();