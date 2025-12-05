const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function testLogin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'e-commerce'
  });

  try {
    // Get all users
    const [users] = await connection.execute('SELECT * FROM users');
    
    console.log('Available users:');
    users.forEach(user => {
      console.log(`- Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });

    // Test admin login
    const testPassword = 'admin123';
    const [adminUsers] = await connection.execute(
      'SELECT * FROM users WHERE role = ?',
      ['admin']
    );

    if (adminUsers.length > 0) {
      const admin = adminUsers[0];
      const isValid = await bcrypt.compare(testPassword, admin.password);
      console.log(`\nAdmin login test:`);
      console.log(`Username: ${admin.username}`);
      console.log(`Password: ${testPassword}`);
      console.log(`Valid: ${isValid}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testLogin();