const fetch = require('node-fetch');

async function testProfileUpdate() {
  try {
    // First login to get token
    const loginResponse = await fetch('http://localhost:5006/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'password'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful, token:', loginData.token);
    
    // Test profile update
    const updateResponse = await fetch('http://localhost:5006/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        full_name: 'Updated Admin Name',
        phone: '081234567890',
        address: 'Updated Address',
        email: 'admin@ekraft.com'
      })
    });
    
    console.log('Update response status:', updateResponse.status);
    console.log('Update response:', await updateResponse.text());
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testProfileUpdate();