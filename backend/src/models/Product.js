const db = require('../config/database');

class Product {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  }

  static async getByCategory(categoryId) {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
    `, [categoryId]);
    return rows;
  }

  static async create(productData) {
    const { name, description, long_description, price, image, rating, stock, category_id, discount, whatsapp } = productData;
    const [result] = await db.execute(`
      INSERT INTO products (name, description, long_description, price, image, rating, stock, category_id, discount, whatsapp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, long_description, price, image, rating || 0, stock || 'available', category_id, discount, whatsapp]);
    return result.insertId;
  }

  static async update(id, productData) {
    const { name, description, long_description, price, image, rating, stock, category_id, discount, whatsapp } = productData;
    const [result] = await db.execute(`
      UPDATE products 
      SET name = ?, description = ?, long_description = ?, price = ?, image = ?, rating = ?, stock = ?, category_id = ?, discount = ?, whatsapp = ?
      WHERE id = ?
    `, [name, description, long_description, price, image, rating, stock, category_id, discount, whatsapp, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Product;