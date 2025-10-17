const db = require('./src/config/database');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const [rows] = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Test categories table
    const [categories] = await db.execute('SELECT COUNT(*) as count FROM categories');
    console.log(`✅ Categories table: ${categories[0].count} records`);
    
    // Test products table
    const [products] = await db.execute('SELECT COUNT(*) as count FROM products');
    console.log(`✅ Products table: ${products[0].count} records`);
    
    // Test join query
    const [joinTest] = await db.execute(`
      SELECT p.name, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LIMIT 1
    `);
    
    if (joinTest.length > 0) {
      console.log(`✅ Join query test: ${joinTest[0].name} - ${joinTest[0].category_name}`);
    }
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testConnection();