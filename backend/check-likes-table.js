const db = require('./src/config/database');

async function checkLikesTable() {
  try {
    console.log('🔍 Checking likes system...\n');

    // Check if product_likes table exists
    const [tables] = await db.execute("SHOW TABLES LIKE 'product_likes'");
    if (tables.length === 0) {
      console.log('❌ product_likes table does not exist');
      return;
    }

    // Check table structure
    const [columns] = await db.execute("DESCRIBE product_likes");
    console.log('📋 product_likes table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    // Check data
    const [likes] = await db.execute("SELECT * FROM product_likes LIMIT 5");
    console.log(`\n📊 Total likes: ${likes.length}`);
    
    if (likes.length > 0) {
      console.log('Recent likes:');
      likes.forEach(like => {
        console.log(`  - Product ${like.product_id} liked by user ${like.user_id}`);
      });
    }

    // Check products likes_count
    const [products] = await db.execute("SELECT id, name, likes_count FROM products LIMIT 5");
    console.log('\n📦 Products likes_count:');
    products.forEach(product => {
      console.log(`  - ${product.name}: ${product.likes_count || 0} likes`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkLikesTable();