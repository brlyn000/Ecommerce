const db = require('../config/database');
const logger = require('../utils/logger');

const tenantAnalyticsController = {
  async getProductAnalytics(req, res) {
    try {
      const tenant_id = req.user.id;

      const [products] = await db.execute(
        `SELECT p.id, p.name, 
         COALESCE(p.likes_count, 0) as likes_count,
         COUNT(DISTINCT oi.order_id) as total_orders,
         COALESCE(SUM(oi.quantity), 0) as total_quantity,
         COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue
         FROM products p
         LEFT JOIN order_items oi ON p.id = oi.product_id
         WHERE p.created_by = ?
         GROUP BY p.id, p.name, p.likes_count`,
        [tenant_id]
      );

      res.json(products);
    } catch (error) {
      logger.error('Get product analytics error:', error.message);
      res.status(500).json({ error: 'Failed to fetch product analytics' });
    }
  },

  async getOverviewStats(req, res) {
    try {
      const tenant_id = req.user.id;

      const [[likeCount], [quantityCount], [orderCount]] = await Promise.all([
        db.execute(
          'SELECT COALESCE(SUM(likes_count), 0) as total FROM products WHERE created_by = ?',
          [tenant_id]
        ),
        db.execute(
          `SELECT COALESCE(SUM(oi.quantity), 0) as total 
           FROM order_items oi 
           JOIN products p ON oi.product_id = p.id 
           WHERE p.created_by = ?`,
          [tenant_id]
        ),
        db.execute(
          `SELECT COUNT(DISTINCT o.order_id) as total 
           FROM orders o 
           JOIN order_items oi ON o.order_id = oi.order_id 
           JOIN products p ON oi.product_id = p.id 
           WHERE p.created_by = ?`,
          [tenant_id]
        ),
      ]);

      res.json({
        totalQuantity: quantityCount[0].total,
        totalLikes: likeCount[0].total,
        totalOrders: orderCount[0].total,
      });
    } catch (error) {
      logger.error('Get overview stats error:', error.message);
      res.status(500).json({ error: 'Failed to fetch overview stats' });
    }
  },

  async getChartData(req, res) {
    try {
      const tenant_id = req.user.id;
      const { year, month } = req.query;

      let dateFilter = '';
      const params = [tenant_id];

      if (year && month && month !== 'all') {
        dateFilter = 'AND YEAR(o.created_at) = ? AND MONTH(o.created_at) = ?';
        params.push(parseInt(year), parseInt(month));
      } else if (year) {
        dateFilter = 'AND YEAR(o.created_at) = ?';
        params.push(parseInt(year));
      }

      const [[monthlyData], [topProducts]] = await Promise.all([
        db.execute(
          `SELECT 
             DATE_FORMAT(o.created_at, '%Y-%m') as month,
             SUM(oi.quantity) as quantity
           FROM orders o
           JOIN order_items oi ON o.order_id = oi.order_id
           JOIN products p ON oi.product_id = p.id
           WHERE p.created_by = ? AND o.status = 'confirmed' ${dateFilter}
           GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
           ORDER BY month DESC
           LIMIT 12`,
          params
        ),
        db.execute(
          `SELECT 
             p.name,
             COUNT(DISTINCT o.order_id) as orders,
             COALESCE(p.likes_count, 0) as likes
           FROM products p
           LEFT JOIN order_items oi ON p.id = oi.product_id
           LEFT JOIN orders o ON oi.order_id = o.order_id
           WHERE p.created_by = ?
           GROUP BY p.id, p.name, p.likes_count
           ORDER BY orders DESC, likes DESC
           LIMIT 5`,
          [tenant_id]
        ),
      ]);

      res.json({ monthlyQuantity: monthlyData, topProducts });
    } catch (error) {
      logger.error('Get chart data error:', error.message);
      res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  },
};

module.exports = tenantAnalyticsController;
