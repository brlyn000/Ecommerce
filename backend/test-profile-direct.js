const fetch = require('node-fetch');

async function testProfile() {
  try {
    // Test if profile route exists
    const testResponse = await fetch('http://localhost:5006/api/profile/test');
    console.log('Test endpoint:', await testResponse.text());
    
    // Login first
    const loginResponse = await fetch('http://localhost:5006/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'user1',
        password: 'password'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful');
      
      // Get profile
      const getResponse = await fetch('http://localhost:5006/api/profile', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      console.log('Get profile:', await getResponse.text());
      
      // Update profile
      const updateResponse = await fetch('http://localhost:5006/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          full_name: 'Updated Name',
          phone: '081234567890',
          address: 'New Address',
          email: 'user@ekraft.com'
        })
      });
      console.log('Update response:', await updateResponse.text());
    } else {
      console.log('Login failed:', await loginResponse.text());
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testProfile();