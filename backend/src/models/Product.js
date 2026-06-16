const db = require('../config/database');

class Product {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name, u.store_name, 
             COALESCE(p.likes_count, 0) as likes_count,
             COALESCE(AVG(CASE WHEN cm.comment_type = 'review' THEN cm.rating END), 0) as average_rating,
             COUNT(CASE WHEN cm.comment_type = 'review' THEN 1 END) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN comments cm ON p.id = cm.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name, u.store_name, 
             COALESCE(p.likes_count, 0) as likes_count,
             COALESCE(AVG(CASE WHEN cm.comment_type = 'review' THEN cm.rating END), 0) as average_rating,
             COUNT(CASE WHEN cm.comment_type = 'review' THEN 1 END) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN comments cm ON p.id = cm.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);
    return rows[0];
  }

  static async getByCategory(categoryId) {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name, u.store_name, 
             COALESCE(p.likes_count, 0) as likes_count,
             COALESCE(AVG(CASE WHEN cm.comment_type = 'review' THEN cm.rating END), 0) as average_rating,
             COUNT(CASE WHEN cm.comment_type = 'review' THEN 1 END) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN comments cm ON p.id = cm.product_id
      WHERE p.category_id = ?
      GROUP BY p.id
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
      SET name = ?, description = ?, long_description = ?, price = ?, image = ?, rating = ?, stock_status = ?, stock = ?, category_id = ?, discount = ?, whatsapp = ?, updated_at = NOW()
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
      SELECT p.*, c.name as category_name, u.store_name, 
             COALESCE(p.likes_count, 0) as likes_count,
             COALESCE(AVG(CASE WHEN cm.comment_type = 'review' THEN cm.rating END), 0) as average_rating,
             COUNT(CASE WHEN cm.comment_type = 'review' THEN 1 END) as review_count,
             COALESCE((SELECT SUM(oi.quantity) FROM order_items oi 
                       WHERE oi.product_id = p.id AND oi.status IN ('accepted', 'completed', 'confirmed')), 0) as total_sold
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN comments cm ON p.id = cm.product_id
      WHERE p.created_by = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [userId]);
    return rows;
  }

  static async search(query) {
    const q = `%${query}%`;
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name, u.store_name,
             COALESCE(p.likes_count, 0) as likes_count,
             COALESCE(AVG(CASE WHEN cm.comment_type = 'review' THEN cm.rating END), 0) as average_rating,
             COUNT(CASE WHEN cm.comment_type = 'review' THEN 1 END) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN comments cm ON p.id = cm.product_id
      WHERE p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `, [q, q, q]);
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Product;