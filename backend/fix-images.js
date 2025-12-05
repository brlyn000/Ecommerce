const db = require('./src/config/database');

async function fixImages() {
  try {
    // Update products dengan gambar yang ada
    await db.execute(
      'UPDATE products SET image = ? WHERE id = ?',
      ['http://localhost:5005/uploads/products/image-1760097632476-862265479.jpg', 1]
    );
    
    await db.execute(
      'UPDATE products SET image = ? WHERE id = ?', 
      ['http://localhost:5005/uploads/products/image-1760097671021-560584145.jpeg', 2]
    );
    
    await db.execute(
      'UPDATE products SET image = ? WHERE id = ?',
      ['http://localhost:5005/uploads/products/image-1760097681395-308134212.jpg', 3]
    );

    console.log('✅ Product images updated');
    
    // Update carousel
    await db.execute(
      'UPDATE carousel SET image = ? WHERE id = ?',
      ['http://localhost:5005/uploads/carousel/image-1760098186827-687204851.jpg', 1]
    );
    
    console.log('✅ Carousel images updated');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixImages();