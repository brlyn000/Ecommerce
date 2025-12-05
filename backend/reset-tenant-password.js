const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetTenantPassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'e-commerce'
  });

  try {
    const newPassword = 'tenant123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await connection.execute(
      'UPDATE users SET password = ? WHERE username = ? AND role = ?',
      [hashedPassword, 'tenant1', 'tenant']
    );

    console.log('Tenant password reset successfully!');
    console.log('Username: tenant1');
    console.log('Password: tenant123');
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await connection.end();
  }
}

resetTenantPassword();