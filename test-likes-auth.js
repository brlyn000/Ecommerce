const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5006/api';

async function testLikesAuth() {
  try {
    console.log('Testing likes with authentication...');
    
    // Test 1: Try to like without token (should fail)
    console.log('\n1. Testing like without authentication...');
    try {
      const response = await fetch(`${API_BASE}/likes/products/1/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      console.log('Response:', result);
      console.log('Status:', response.status);
    } catch (error) {
      console.log('Error (expected):', error.message);
    }
    
    // Test 2: Login first
    console.log('\n2. Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful:', loginData.user.username);
      
      const token = loginData.token;
      
      // Test 3: Try to like with token (should work)
      console.log('\n3. Testing like with authentication...');
      const likeResponse = await fetch(`${API_BASE}/likes/products/1/toggle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (likeResponse.ok) {
        const likeResult = await likeResponse.json();
        console.log('Like result:', likeResult);
      } else {
        console.log('Like failed:', await likeResponse.text());
      }
      
      // Test 4: Get like status
      console.log('\n4. Testing get like status...');
      const statusResponse = await fetch(`${API_BASE}/likes/products/1/status`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        console.log('Like status:', statusResult);
      } else {
        console.log('Status failed:', await statusResponse.text());
      }
      
    } else {
      console.log('Login failed:', await loginResponse.text());
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLikesAuth();