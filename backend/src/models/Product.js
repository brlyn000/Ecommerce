const db = require('../config/database');

class Product {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name, COALESCE(p.likes_count, 0) as likes_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name, COALESCE(p.likes_count, 0) as likes_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  }

  static async getByCategory(categoryId) {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name, COALESCE(p.likes_count, 0) as likes_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
    `, [categoryId]);
    return rows;
  }

  static async create(productData) {
    const { name, description, long_description, price, image, rating, stock_status, stock, category_id, discount, whatsapp, created_by } = productData;
    const finalStockStatus = (stock && stock <= 0) ? 'sold-out' : (stock_status || 'available');
    
    const [result] = await db.execute(`
      INSERT INTO products (name, description, long_description, price, image, rating, stock_status, stock, category_id, discount, whatsapp, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, 
      description, 
      long_description || null, 
      price, 
      image || null, 
      rating || 0, 
      finalStockStatus, 
      stock || 0,
      category_id, 
      discount || null, 
      whatsapp || null, 
      created_by
    ]);
    return result.insertId;
  }

  static async update(id, productData) {
    const { name, description, long_description, price, image, rating, stock_status, stock, category_id, discount, whatsapp } = productData;
    const finalStockStatus = (stock && stock <= 0) ? 'sold-out' : (stock_status || 'available');
    
    const [result] = await db.execute(`
      UPDATE products 
      SET name = ?, description = ?, long_description = ?, price = ?, image = ?, rating = ?, stock_status = ?, stock = ?, category_id = ?, discount = ?, whatsapp = ?
      WHERE id = ?
    `, [
      name, 
      description, 
      long_description || null, 
      price, 
      image || null, 
      rating || 0, 
      finalStockStatus, 
      stock || 0,
      category_id, 
      discount || null, 
      whatsapp || null, 
      id
    ]);
    return result.affectedRows > 0;
  }

  static async getByUserId(userId) {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name, COALESCE(p.likes_count, 0) as likes_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.created_by = ?
      ORDER BY p.created_at DESC
    `, [userId]);
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Product;