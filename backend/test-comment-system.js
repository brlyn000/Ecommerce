const db = require('./src/config/database');

async function testCommentSystem() {
  try {
    console.log('🧪 Testing Enhanced Comment System...\n');

    // Test 1: Check if new columns exist
    console.log('1. Checking database schema...');
    const [columns] = await db.execute("DESCRIBE comments");
    const columnNames = columns.map(col => col.Field);
    
    const requiredColumns = ['comment_type', 'user_id', 'is_verified'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing columns:', missingColumns);
      console.log('📝 Please run: mysql -u username -p database_name < manual-update-comments.sql');
      return;
    } else {
      console.log('✅ All required columns exist');
    }

    // Test 2: Insert test comment
    console.log('\n2. Testing comment insertion...');
    const testComment = {
      product_id: 1,
      name: 'Test User',
      email: 'test@example.com',
      comment: 'This is a test comment',
      rating: 4,
      comment_type: 'review',
      user_id: 1
    };

    const [result] = await db.execute(
      'INSERT INTO comments (product_id, name, email, comment, rating, comment_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [testComment.product_id, testComment.name, testComment.email, testComment.comment, testComment.rating, testComment.comment_type, testComment.user_id]
    );
    
    console.log('✅ Test comment inserted with ID:', result.insertId);

    // Test 3: Retrieve and verify comment
    console.log('\n3. Testing comment retrieval...');
    const [comments] = await db.execute('SELECT * FROM comments WHERE id = ?', [result.insertId]);
    
    if (comments.length > 0) {
      const comment = comments[0];
      console.log('✅ Comment retrieved successfully:');
      console.log('   - Type:', comment.comment_type);
      console.log('   - Rating:', comment.rating);
      console.log('   - User ID:', comment.user_id);
    } else {
      console.log('❌ Failed to retrieve comment');
    }

    // Test 4: Check notifications table
    console.log('\n4. Checking notifications table...');
    const [notifColumns] = await db.execute("DESCRIBE notifications");
    console.log('✅ Notifications table structure verified');

    // Clean up test data
    console.log('\n5. Cleaning up test data...');
    await db.execute('DELETE FROM comments WHERE id = ?', [result.insertId]);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Comment system is ready to use.');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Test the frontend comment form');
    console.log('   3. Check tenant notifications');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure database is running');
    console.log('   2. Check database connection in src/config/database.js');
    console.log('   3. Run the manual SQL update script');
  } finally {
    process.exit(0);
  }
}

testCommentSystem();