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
    const keywords = query.trim().split(/\s+/).filter(Boolean);

    // WHERE params: each keyword needs 3 params (name, description, category)
    const whereParams = [];
    const whereClauses = keywords.map(kw => {
      whereParams.push(`%${kw}%`, `%${kw}%`, `%${kw}%`);
      return '(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
    });

    // Relevance score params: each keyword needs 4 params (exact name, name LIKE, desc LIKE, cat LIKE)
    // Score = (Relevansi * 0.5) + (Klik * 0.3) + (Transaksi * 0.2)
    const relevanceParams = [];
    const relevanceParts = keywords.map(kw => {
      relevanceParams.push(kw, `%${kw}%`, `%${kw}%`, `%${kw}%`);
      return `(CASE WHEN LOWER(p.name) = LOWER(?) THEN 3 WHEN p.name LIKE ? THEN 2 ELSE 0 END + CASE WHEN p.description LIKE ? THEN 1 ELSE 0 END + CASE WHEN c.name LIKE ? THEN 1 ELSE 0 END)`;
    });
    const relevanceExpr = relevanceParts.join(' + ');

    // relevanceExpr appears twice in SELECT (as relevance_score and inside ranking_score)
    const allParams = [...whereParams, ...relevanceParams, ...relevanceParams];

    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name, u.store_name,
             COALESCE(p.likes_count, 0) as likes_count,
             COALESCE(AVG(CASE WHEN cm.comment_type = 'review' THEN cm.rating END), 0) as average_rating,
             COUNT(CASE WHEN cm.comment_type = 'review' THEN 1 END) as review_count,
             COALESCE((SELECT SUM(oi.quantity) FROM order_items oi
                       WHERE oi.product_id = p.id AND oi.status IN ('accepted','completed','confirmed')), 0) as total_sold,
             COALESCE((SELECT click_count FROM product_search_clicks sc WHERE sc.product_id = p.id), 0) as search_clicks,
             (${relevanceExpr}) as relevance_score,
             (
               (${relevanceExpr}) * 0.5 +
               COALESCE((SELECT click_count FROM product_search_clicks sc WHERE sc.product_id = p.id), 0) * 0.3 +
               COALESCE((SELECT SUM(oi.quantity) FROM order_items oi
                         WHERE oi.product_id = p.id AND oi.status IN ('accepted','completed','confirmed')), 0) * 0.2
             ) as ranking_score
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN comments cm ON p.id = cm.product_id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY p.id
      ORDER BY ranking_score DESC
      LIMIT 50
    `, allParams);
    return rows;
  }

  static async trackClick(productId) {
    await db.execute(`
      INSERT INTO product_search_clicks (product_id, click_count)
      VALUES (?, 1)
      ON DUPLICATE KEY UPDATE click_count = click_count + 1, updated_at = NOW()
    `, [productId]);
  }

  static async getTrendingSearches() {
    const [rows] = await db.execute(`
      SELECT p.id, p.name, p.image, p.price, p.discount, c.name as category_name, sc.click_count
      FROM product_search_clicks sc
      JOIN products p ON sc.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY sc.click_count DESC
      LIMIT 6
    `);
    return rows;
  }

  static async delete(id) {
    await db.execute('DELETE FROM order_items WHERE product_id = ?', [id]);
    await db.execute('DELETE FROM comments WHERE product_id = ?', [id]);
    await db.execute('DELETE FROM product_likes WHERE product_id = ?', [id]);
    await db.execute('DELETE FROM notifications WHERE product_id = ?', [id]);
    await db.execute('DELETE FROM product_search_clicks WHERE product_id = ?', [id]);
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Product;