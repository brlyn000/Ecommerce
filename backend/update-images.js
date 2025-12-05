const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Update products dengan gambar yang ada
    await connection.execute(`
      UPDATE products SET image = 'http://localhost:5005/uploads/products/image-1760097632476-862265479.jpg' WHERE id = 1
    `);
    await connection.execute(`
      UPDATE products SET image = 'http://localhost:5005/uploads/products/image-1760097671021-560584145.jpeg' WHERE id = 2
    `);
    await connection.execute(`
      UPDATE products SET image = 'http://localhost:5005/uploads/products/image-1760097681395-308134212.jpg' WHERE id = 3
    `);

    // Update carousel dengan gambar yang ada
    await connection.execute(`
      UPDATE carousel SET image = 'http://localhost:5005/uploads/carousel/image-1760098186827-687204851.jpg' WHERE id = 1
    `);

    console.log('✅ Images updated successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

updateImages();