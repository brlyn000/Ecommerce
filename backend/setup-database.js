const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`Database '${process.env.DB_NAME}' created or already exists`);

    // Close connection and reconnect to the specific database
    await connection.end();
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log(`Connected to database '${process.env.DB_NAME}'`);

    // Create categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        link VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        long_description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(255),
        rating INT DEFAULT 0,
        stock_status ENUM('available', 'limited', 'sold-out') DEFAULT 'available',
        category_id INT,
        discount VARCHAR(10),
        whatsapp VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Create carousel table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS carousel_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        image VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 1,
        button_text VARCHAR(50),
        button_link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables created successfully');

    // Check if categories exist, if not insert sample data
    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    if (categories[0].count === 0) {
      await connection.execute(`
        INSERT INTO categories (name, description, icon, link) VALUES
        ('Tools', 'Peralatan dan teknologi terkini', 'FaTools', '/category/tools'),
        ('Food', 'Makanan dan minuman berkualitas', 'FaUtensils', '/category/food'),
        ('Digital Product', 'Produk digital dan elektronik', 'FaLaptop', '/category/digital-product'),
        ('Fashion', 'Pakaian dan aksesoris trendy', 'FaTshirt', '/category/fashion'),
        ('Books', 'Buku dan media pembelajaran', 'FaBook', '/category/books')
      `);
      console.log('Sample categories inserted');
    }

    // Check if products exist, if not insert sample data
    const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
    if (products[0].count === 0) {
      await connection.execute(`
        INSERT INTO products (name, description, long_description, price, image, rating, stock_status, category_id, discount, whatsapp) VALUES
        ('Apple Watch Series 7 GPS', 'Aluminium Case, Starlight Sport', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 5000000, '/images/product1.webp', 4, 'available', 1, '', 'https://wa.me/6281234567890'),
        ('Samsung Galaxy Buds Pro', 'Wireless Noise Cancelling Earbuds', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 2500000, '/images/product2.webp', 5, 'available', 1, '', 'https://wa.me/6281234567890'),
        ('MacBook Air M1', '13-inch, 8GB RAM, 256GB SSD', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 12000000, '/images/product3.webp', 5, 'available', 3, '10%', 'https://wa.me/6281234567890'),
        ('Nike Air Jordan 1', 'Original Retro High OG', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 3500000, '/images/product4.webp', 4, 'limited', 4, '15%', 'https://wa.me/6281234567890')
      `);
      console.log('Sample products inserted');
    }

    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();