const db = require('../config/database');

class Category {
  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM categories');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(categoryData) {
    const { name, description, icon, link } = categoryData;
    const [result] = await db.execute(`
      INSERT INTO categories (name, description, icon, link)
      VALUES (?, ?, ?, ?)
    `, [name, description, icon, link]);
    return result.insertId;
  }

  static async update(id, categoryData) {
    const { name, description, icon, link } = categoryData;
    const [result] = await db.execute(`
      UPDATE categories 
      SET name = ?, description = ?, icon = ?, link = ?
      WHERE id = ?
    `, [name, description, icon, link, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Category;