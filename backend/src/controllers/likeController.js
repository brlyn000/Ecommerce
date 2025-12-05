const db = require('../config/database');

const likeController = {
  async toggleLike(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      // Check if like exists
      const [existingLike] = await db.execute(
        'SELECT id FROM product_likes WHERE product_id = ? AND user_id = ?',
        [productId, userId]
      );

      if (existingLike.length > 0) {
        // Unlike - remove like
        await db.execute(
          'DELETE FROM product_likes WHERE product_id = ? AND user_id = ?',
          [productId, userId]
        );
        
        // Decrease likes count
        await db.execute(
          'UPDATE products SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ?',
          [productId]
        );
        
        res.json({ liked: false, message: 'Product unliked' });
      } else {
        // Like - add like
        await db.execute(
          'INSERT INTO product_likes (product_id, user_id) VALUES (?, ?)',
          [productId, userId]
        );
        
        // Increase likes count
        await db.execute(
          'UPDATE products SET likes_count = likes_count + 1 WHERE id = ?',
          [productId]
        );
        
        // Get product and tenant info for notification
        const [product] = await db.execute(
          'SELECT name, price, discount, created_by FROM products WHERE id = ?',
          [productId]
        );
        
        const [user] = await db.execute(
          'SELECT full_name, username FROM users WHERE id = ?',
          [userId]
        );
        
        // Create notification for tenant
        if (product[0] && user[0]) {
          const finalPrice = product[0].discount ? product[0].price * (1 - product[0].discount / 100) : product[0].price;
          await db.execute(
            'INSERT INTO notifications (type, tenant_id, product_id, message, data) VALUES (?, ?, ?, ?, ?)',
            [
              'like',
              product[0].created_by,
              productId,
              `${user[0].full_name || user[0].username} liked your product "${product[0].name}"`,
              JSON.stringify({ 
                product_name: product[0].name, 
                customer_name: user[0].full_name || user[0].username,
                original_price: product[0].price,
                final_price: finalPrice,
                discount: product[0].discount || 0
              })
            ]
          );
        }
        
        res.json({ liked: true, message: 'Product liked' });
      }
    } catch (error) {
      console.error('Like toggle error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getLikeStatus(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user?.id;

      let liked = false;
      if (userId) {
        const [like] = await db.execute(
          'SELECT id FROM product_likes WHERE product_id = ? AND user_id = ?',
          [productId, userId]
        );
        liked = like.length > 0;
      }

      // Get actual count from product_likes table
      const [likeCount] = await db.execute(
        'SELECT COUNT(*) as count FROM product_likes WHERE product_id = ?',
        [productId]
      );

      res.json({ 
        liked: liked,
        likesCount: likeCount[0]?.count || 0
      });
    } catch (error) {
      console.error('Get like status error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = likeController;