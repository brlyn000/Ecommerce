const db = require('../config/database');

const commentController = {
  async getByProductId(req, res) {
    try {
      const [comments] = await db.execute(
        'SELECT * FROM comments WHERE product_id = ? ORDER BY created_at DESC',
        [req.params.productId]
      );
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { product_id, name, email, comment, rating } = req.body;
      const [result] = await db.execute(
        'INSERT INTO comments (product_id, name, email, comment, rating) VALUES (?, ?, ?, ?, ?)',
        [product_id, name, email, comment, rating || 5]
      );
      res.status(201).json({ id: result.insertId, message: 'Comment added successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const [result] = await db.execute('DELETE FROM comments WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = commentController;