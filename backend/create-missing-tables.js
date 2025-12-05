const db = require('./src/config/database');

async function createMissingTables() {
  try {
    // Create contacts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(200),
        message TEXT,
        status ENUM('new', 'read', 'replied') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create carousel table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS carousel (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        image VARCHAR(500),
        button_text VARCHAR(100),
        button_link VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Update product images to port 5006
    await db.execute(`
      UPDATE products SET image = REPLACE(image, 'localhost:5005', 'localhost:5006')
    `);

    // Insert sample carousel
    await db.execute(`
      INSERT IGNORE INTO carousel (id, title, description, image, button_text, button_link) VALUES
      (1, 'Selamat Datang di E-Kraft', 'Temukan produk berkualitas untuk kebutuhan Anda', 'http://localhost:5006/uploads/carousel/image-1760098186827-687204851.jpg', 'Jelajahi Produk', '#')
    `);

    console.log('✅ Missing tables created and images updated');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createMissingTables();