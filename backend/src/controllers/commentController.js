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
      const { product_id, name, email, comment, rating, comment_type, user_id } = req.body;
      
      const [result] = await db.execute(
        'INSERT INTO comments (product_id, name, email, comment, rating, comment_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product_id, name, email, comment, rating || 5, comment_type || 'comment', user_id || null]
      );
      
      // Update product rating if this is a review
      if (comment_type === 'review' && rating) {
        const [avgRating] = await db.execute(
          'SELECT AVG(rating) as avg_rating FROM comments WHERE product_id = ? AND comment_type = "review"',
          [product_id]
        );
        
        await db.execute(
          'UPDATE products SET rating = ? WHERE id = ?',
          [Math.round(avgRating[0].avg_rating * 10) / 10, product_id]
        );
      }
      
      // Send notification to tenant
      try {
        const [productRows] = await db.execute(
          'SELECT created_by, name as product_name FROM products WHERE id = ?',
          [product_id]
        );
        
        if (productRows.length > 0) {
          const tenantId = productRows[0].created_by;
          const productName = productRows[0].product_name;
          
          await db.execute(
            `INSERT INTO notifications (type, tenant_id, product_id, message, data, created_at) 
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              comment_type === 'review' ? 'review' : 'comment',
              tenantId,
              product_id,
              `New ${comment_type === 'review' ? 'review' : 'comment'} on ${productName}`,
              JSON.stringify({
                customer_name: name,
                customer_email: email,
                comment: comment,
                rating: rating,
                comment_type: comment_type || 'comment'
              })
            ]
          );
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }
      
      res.status(201).json({ id: result.insertId, message: 'Comment added successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { comment, rating } = req.body;
      const [result] = await db.execute(
        'UPDATE comments SET comment = ?, rating = ? WHERE id = ?',
        [comment, rating, req.params.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      res.json({ message: 'Comment updated successfully' });
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