const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database for migration');

    // Check if category_id column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'category_id'
    `, [process.env.DB_NAME]);

    if (columns.length === 0) {
      console.log('Adding category_id column to products table...');
      
      // Add category_id column
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN category_id INT AFTER stock
      `);
      
      // Create mapping from category names to IDs
      const categoryMapping = {
        'tools': 1,
        'food': 2,
        'digital-product': 3,
        'fashion': 4,
        'books': 5
      };
      
      // Update category_id based on existing category column
      for (const [categoryName, categoryId] of Object.entries(categoryMapping)) {
        await connection.execute(`
          UPDATE products 
          SET category_id = ? 
          WHERE category = ?
        `, [categoryId, categoryName]);
      }
      
      console.log('✅ category_id column added and populated');
    }

    // Check if stock_status column exists
    const [stockColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'stock_status'
    `, [process.env.DB_NAME]);

    if (stockColumns.length === 0) {
      console.log('Adding stock_status column...');
      
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN stock_status ENUM('available', 'limited', 'sold-out') DEFAULT 'available' AFTER rating
      `);
      
      // Map existing stock values to stock_status
      await connection.execute(`
        UPDATE products 
        SET stock_status = CASE 
          WHEN stock = 'available' THEN 'available'
          WHEN stock = 'limited' THEN 'limited'
          WHEN stock = 'sold-out' THEN 'sold-out'
          ELSE 'available'
        END
      `);
      
      console.log('✅ stock_status column added and populated');
    }

    // Add foreign key constraint if it doesn't exist
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'category_id' AND REFERENCED_TABLE_NAME = 'categories'
    `, [process.env.DB_NAME]);

    if (constraints.length === 0) {
      try {
        await connection.execute(`
          ALTER TABLE products 
          ADD CONSTRAINT fk_products_category 
          FOREIGN KEY (category_id) REFERENCES categories(id)
        `);
        console.log('✅ Foreign key constraint added');
      } catch (error) {
        console.log('⚠️  Foreign key constraint already exists or cannot be added:', error.message);
      }
    }

    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateDatabase();