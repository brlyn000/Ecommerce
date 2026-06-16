const db = require('../config/database');
const logger = require('../utils/logger');

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
      
      // If this is a review, validate that user actually purchased this product
      if (comment_type === 'review' && user_id) {
        const [purchaseCheck] = await db.execute(
          `SELECT COUNT(*) as purchase_count 
           FROM orders o 
           JOIN order_items oi ON o.order_id = oi.order_id 
           WHERE o.user_id = ? AND oi.product_id = ? AND oi.status = 'confirmed'`,
          [user_id, product_id]
        );
        
        if (purchaseCheck[0].purchase_count === 0) {
          return res.status(403).json({ 
            error: 'You can only review products you have purchased and received' 
          });
        }
        
        // Check if user already reviewed this product
        const [existingReview] = await db.execute(
          'SELECT id FROM comments WHERE product_id = ? AND user_id = ? AND comment_type = "review"',
          [product_id, user_id]
        );
        
        if (existingReview.length > 0) {
          return res.status(400).json({ 
            error: 'You have already reviewed this product' 
          });
        }
      }
      
      const [result] = await db.execute(
        'INSERT INTO comments (product_id, name, email, comment, rating, comment_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product_id, name, email, comment, rating || 5, comment_type || 'comment', user_id || null]
      );
      
      // Rating is now calculated dynamically in Product model
      
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
        logger.error('Failed to send notification:', notifError.message);
      }
      
      res.status(201).json({ id: result.insertId, message: 'Comment added successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { comment, rating } = req.body;
      const user_id = req.user?.id;
      
      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if comment exists and belongs to user
      const [commentCheck] = await db.execute(
        'SELECT user_id, product_id, comment_type FROM comments WHERE id = ?',
        [req.params.id]
      );
      
      if (commentCheck.length === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      
      if (commentCheck[0].user_id !== user_id) {
        return res.status(403).json({ error: 'You can only edit your own comments' });
      }
      
      // Update comment
      await db.execute(
        'UPDATE comments SET comment = ?, rating = ? WHERE id = ? AND user_id = ?',
        [comment, rating || null, req.params.id, user_id]
      );
      
      // Rating is now calculated dynamically in Product model
      
      res.json({ message: 'Comment updated successfully' });
    } catch (error) {
      logger.error('Comment update error:', error.message);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  },

  async delete(req, res) {
    try {
      const user_id = req.user.id;
      
      // Check if comment exists and belongs to user
      const [commentCheck] = await db.execute(
        'SELECT user_id, product_id, comment_type FROM comments WHERE id = ?',
        [req.params.id]
      );
      
      if (commentCheck.length === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      
      if (commentCheck[0].user_id !== user_id) {
        return res.status(403).json({ error: 'You can only delete your own comments' });
      }
      
      const [result] = await db.execute(
        'DELETE FROM comments WHERE id = ? AND user_id = ?', 
        [req.params.id, user_id]
      );
      
      // Rating is now calculated dynamically in Product model
      
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = commentController;