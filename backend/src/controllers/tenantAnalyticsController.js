const db = require('../config/database');

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
      console.error('Get product analytics error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getOverviewStats(req, res) {
    try {
      const tenant_id = req.user.id;
      
      // Get total likes
      const [likeCount] = await db.execute(
        'SELECT COALESCE(SUM(likes_count), 0) as total FROM products WHERE created_by = ?',
        [tenant_id]
      );
      
      // Get total quantity sold
      const [quantityCount] = await db.execute(
        `SELECT COALESCE(SUM(oi.quantity), 0) as total 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE p.created_by = ?`,
        [tenant_id]
      );
      
      // Get total unique orders
      const [orderCount] = await db.execute(
        `SELECT COUNT(DISTINCT o.order_id) as total 
         FROM orders o 
         JOIN order_items oi ON o.order_id = oi.order_id 
         JOIN products p ON oi.product_id = p.id 
         WHERE p.created_by = ?`,
        [tenant_id]
      );
      
      res.json({
        totalQuantity: quantityCount[0].total,
        totalLikes: likeCount[0].total,
        totalOrders: orderCount[0].total
      });
    } catch (error) {
      console.error('Get overview stats error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getChartData(req, res) {
    try {
      const tenant_id = req.user.id;
      const { year, month } = req.query;
      
      let dateFilter = '';
      let params = [tenant_id];
      
      if (year && month && month !== 'all') {
        dateFilter = 'AND YEAR(o.created_at) = ? AND MONTH(o.created_at) = ?';
        params.push(year, month);
      } else if (year) {
        dateFilter = 'AND YEAR(o.created_at) = ?';
        params.push(year);
      }
      
      // Monthly quantity data
      const [monthlyData] = await db.execute(
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
      );
      
      // Top products by orders
      const [topProducts] = await db.execute(
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
      );
      
      res.json({
        monthlyQuantity: monthlyData,
        topProducts: topProducts
      });
    } catch (error) {
      console.error('Get chart data error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = tenantAnalyticsController;