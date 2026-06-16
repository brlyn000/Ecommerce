const db = require('../config/database');
const logger = require('../utils/logger');

const likeController = {
  async toggleLike(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const [existingLike] = await db.execute(
        'SELECT id FROM product_likes WHERE product_id = ? AND user_id = ?',
        [productId, userId]
      );

      if (existingLike.length > 0) {
        await db.execute(
          'DELETE FROM product_likes WHERE product_id = ? AND user_id = ?',
          [productId, userId]
        );
        await db.execute(
          'UPDATE products SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ?',
          [productId]
        );
        return res.json({ liked: false, message: 'Product unliked' });
      }

      await db.execute(
        'INSERT INTO product_likes (product_id, user_id) VALUES (?, ?)',
        [productId, userId]
      );
      await db.execute(
        'UPDATE products SET likes_count = likes_count + 1 WHERE id = ?',
        [productId]
      );

      // Fetch product + user in parallel for notification
      const [[productRows], [userRows]] = await Promise.all([
        db.execute('SELECT name, price, discount, created_by FROM products WHERE id = ?', [productId]),
        db.execute('SELECT full_name, username FROM users WHERE id = ?', [userId]),
      ]);

      if (productRows.length > 0 && userRows.length > 0) {
        const product = productRows[0];
        const user = userRows[0];
        const finalPrice = product.discount
          ? product.price * (1 - product.discount / 100)
          : product.price;

        await db.execute(
          'INSERT INTO notifications (type, tenant_id, product_id, message, data) VALUES (?, ?, ?, ?, ?)',
          [
            'like',
            product.created_by,
            productId,
            `${user.full_name || user.username} liked your product "${product.name}"`,
            JSON.stringify({
              product_name: product.name,
              customer_name: user.full_name || user.username,
              original_price: product.price,
              final_price: finalPrice,
              discount: product.discount || 0,
            }),
          ]
        );
      }

      res.json({ liked: true, message: 'Product liked' });
    } catch (error) {
      logger.error('Like toggle error:', error.message);
      res.status(500).json({ error: 'Failed to toggle like' });
    }
  },

  async getLikeStatus(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user?.id;

      const [[likeRows], [countRows]] = await Promise.all([
        userId
          ? db.execute('SELECT id FROM product_likes WHERE product_id = ? AND user_id = ?', [productId, userId])
          : Promise.resolve([[]]),
        db.execute('SELECT COUNT(*) as count FROM product_likes WHERE product_id = ?', [productId]),
      ]);

      res.json({
        liked: likeRows.length > 0,
        likesCount: countRows[0]?.count || 0,
      });
    } catch (error) {
      logger.error('Get like status error:', error.message);
      res.status(500).json({ error: 'Failed to get like status' });
    }
  },
};

module.exports = likeController;
