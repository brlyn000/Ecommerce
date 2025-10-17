// Test script to verify frontend can connect to backend API
const API_BASE_URL = 'http://localhost:5003/api';

async function testAPI() {
  console.log('🧪 Testing Frontend API Connection...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Health check:', health.message);
    } else {
      console.log('❌ Health check failed');
    }

    // Test categories
    console.log('\n2. Testing categories endpoint...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log(`✅ Categories: ${categories.length} items found`);
      if (categories.length > 0) {
        console.log(`   Sample: ${categories[0].name}`);
      }
    } else {
      console.log('❌ Categories fetch failed');
    }

    // Test products
    console.log('\n3. Testing products endpoint...');
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log(`✅ Products: ${products.length} items found`);
      if (products.length > 0) {
        console.log(`   Sample: ${products[0].name} - ${products[0].category_name}`);
      }
    } else {
      console.log('❌ Products fetch failed');
    }

    // Test single product
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      if (products.length > 0) {
        console.log('\n4. Testing single product endpoint...');
        const productResponse = await fetch(`${API_BASE_URL}/products/${products[0].id}`);
        if (productResponse.ok) {
          const product = await productResponse.json();
          console.log(`✅ Single product: ${product.name}`);
        } else {
          console.log('❌ Single product fetch failed');
        }
      }
    }

    console.log('\n🎉 API connection test completed!');
    
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    console.log('\n💡 Make sure backend server is running on http://localhost:5003');
  }
}

// Run the test
testAPI();