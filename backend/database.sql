CREATE DATABASE IF NOT EXISTS `e-commerce`;
USE `e-commerce`;

-- Categories table
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  link VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
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
);

-- Insert sample categories
INSERT INTO categories (name, description, icon, link) VALUES
('Tools', 'Peralatan dan teknologi terkini', 'FaTools', '/category/tools'),
('Food', 'Makanan dan minuman berkualitas', 'FaUtensils', '/category/food'),
('Digital Product', 'Produk digital dan elektronik', 'FaLaptop', '/category/digital-product'),
('Fashion', 'Pakaian dan aksesoris trendy', 'FaTshirt', '/category/fashion'),
('Books', 'Buku dan media pembelajaran', 'FaBook', '/category/books');

-- Carousel table
CREATE TABLE carousel_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 1,
  button_text VARCHAR(50),
  button_link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, description, long_description, price, image, rating, stock_status, category_id, discount, whatsapp) VALUES
('Apple Watch Series 7 GPS', 'Aluminium Case, Starlight Sport', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 5000000, '/images/product1.webp', 4, 'available', 1, '', 'https://wa.me/6281234567890'),
('Samsung Galaxy Buds Pro', 'Wireless Noise Cancelling Earbuds', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 2500000, '/images/product2.webp', 5, 'available', 1, '', 'https://wa.me/6281234567890'),
('MacBook Air M1', '13-inch, 8GB RAM, 256GB SSD', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 12000000, '/images/product3.webp', 5, 'available', 3, '10%', 'https://wa.me/6281234567890'),
('Nike Air Jordan 1', 'Original Retro High OG', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 3500000, '/images/product4.webp', 4, 'limited', 4, '15%', 'https://wa.me/6281234567890');

-- Insert sample carousel items
INSERT INTO carousel_items (title, description, image, active, display_order, button_text, button_link) VALUES
('Promo Spesial Hari Ini!', 'Dapatkan diskon hingga 50% untuk produk pilihan', '/uploads/carousel/carousel1.webp', TRUE, 1, 'Shop Now', '/products'),
('Teknologi Terkini', 'Solusi perangkat modern untuk kebutuhan Anda', '/uploads/carousel/carousel2.webp', TRUE, 2, 'Explore', '/categories'),
('Layanan Cepat & Tepat', 'Tim profesional siap membantu kapan saja', '/uploads/carousel/carousel3.webp', TRUE, 3, 'Contact Us', '/contact');