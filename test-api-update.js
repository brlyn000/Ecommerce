import fetch from 'node-fetch';

async function testAPIUpdate() {
  try {
    console.log('Testing API product update...');
    
    // Get products first
    const productsResponse = await fetch('http://localhost:5003/api/products');
    const products = await productsResponse.json();
    
    if (products.length === 0) {
      console.log('No products found');
      return;
    }
    
    const product = products[0];
    console.log('Testing with product:', product.id, product.name);
    
    // Test update
    const updateData = {
      name: product.name,
      description: product.description,
      long_description: product.long_description || '',
      price: product.price,
      image: product.image,
      rating: product.rating || 0,
      stock: product.stock || 'available',
      category_id: product.category_id || 1,
      discount: product.discount || '',
      whatsapp: product.whatsapp || ''
    };
    
    console.log('Sending update data:', updateData);
    
    const updateResponse = await fetch(`http://localhost:5003/api/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('Response status:', updateResponse.status);
    
    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ Update successful:', result);
    } else {
      const error = await updateResponse.text();
      console.log('❌ Update failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAPIUpdate();