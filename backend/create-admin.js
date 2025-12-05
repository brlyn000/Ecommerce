const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'e-commerce'
  });

  try {
    // Check if admin exists
    const [existing] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      ['admin', 'admin@example.com']
    );

    if (existing.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(
      'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)',
      ['admin', 'admin@example.com', hashedPassword, 'admin', 'Administrator']
    );

    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@example.com');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await connection.end();
  }
}

createAdmin();