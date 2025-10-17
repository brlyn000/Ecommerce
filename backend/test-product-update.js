const db = require('./src/config/database');

async function testProductUpdate() {
  try {
    console.log('Testing product update...');
    
    // Get first product
    const [products] = await db.execute('SELECT * FROM products LIMIT 1');
    if (products.length === 0) {
      console.log('No products found');
      return;
    }
    
    const product = products[0];
    console.log('Original product:', {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock
    });
    
    // Test update
    const updateData = {
      name: product.name,
      description: product.description,
      long_description: product.long_description,
      price: product.price,
      image: product.image,
      rating: product.rating,
      stock: product.stock,
      category_id: product.category_id,
      discount: product.discount,
      whatsapp: product.whatsapp
    };
    
    const [result] = await db.execute(`
      UPDATE products 
      SET name = ?, description = ?, long_description = ?, price = ?, image = ?, rating = ?, stock = ?, category_id = ?, discount = ?, whatsapp = ?
      WHERE id = ?
    `, [
      updateData.name,
      updateData.description, 
      updateData.long_description,
      updateData.price,
      updateData.image,
      updateData.rating,
      updateData.stock,
      updateData.category_id,
      updateData.discount,
      updateData.whatsapp,
      product.id
    ]);
    
    console.log('Update result:', {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    });
    
    if (result.affectedRows > 0) {
      console.log('✅ Product update successful');
    } else {
      console.log('❌ Product update failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing product update:', error);
  } finally {
    process.exit(0);
  }
}

testProductUpdate();