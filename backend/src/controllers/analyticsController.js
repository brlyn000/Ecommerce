const db = require('../config/database');
const logger = require('../utils/logger');

// Helper: jalankan query dan langsung ambil rows (index 0)
const q = async (sql, params = []) => {
  const [rows] = await db.execute(sql, params);
  return rows;
};

const analyticsController = {
  async getOverview(req, res) {
    try {
      const [
        productCount, categoryCount, contactCount, carouselCount,
        userCount, tenantCount, orderCount, revenueRow,
        pendingOrders, soldOutProducts,
        productsByCategory, contactStatus, recentOrders,
        userGrowth, orderTrend, revenueTrend,
      ] = await Promise.all([
        q('SELECT COUNT(*) as count FROM products'),
        q('SELECT COUNT(*) as count FROM categories'),
        q('SELECT COUNT(*) as count FROM contacts'),
        q('SELECT COUNT(*) as count FROM carousel_items'),
        q("SELECT COUNT(*) as count FROM users WHERE role = 'user'"),
        q("SELECT COUNT(*) as count FROM users WHERE role = 'tenant'"),
        q('SELECT COUNT(*) as count FROM orders'),
        q("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status NOT IN ('cancelled')"),
        q("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"),
        q("SELECT COUNT(*) as count FROM products WHERE stock = 0 OR stock_status = 'sold-out'"),
        q(`SELECT c.name as category, COUNT(p.id) as count
           FROM categories c LEFT JOIN products p ON c.id = p.category_id
           GROUP BY c.id, c.name ORDER BY count DESC`),
        q(`SELECT status, COUNT(*) as count FROM contacts GROUP BY status`),
        q(`SELECT o.order_id, o.customer_name, o.total, o.status, o.created_at,
                  COUNT(oi.id) as item_count
           FROM orders o LEFT JOIN order_items oi ON o.order_id = oi.order_id
           GROUP BY o.order_id ORDER BY o.created_at DESC LIMIT 5`),
        q(`SELECT DATE(created_at) as date, COUNT(*) as count
           FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND role = 'user'
           GROUP BY DATE(created_at) ORDER BY date ASC`),
        q(`SELECT DATE(created_at) as date, COUNT(*) as count
           FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           GROUP BY DATE(created_at) ORDER BY date ASC`),
        q(`SELECT DATE(created_at) as date, COALESCE(SUM(total), 0) as total
           FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           AND status NOT IN ('cancelled')
           GROUP BY DATE(created_at) ORDER BY date ASC`),
      ]);

      res.json({
        overview: {
          products: productCount[0].count,
          categories: categoryCount[0].count,
          contacts: contactCount[0].count,
          carousel: carouselCount[0].count,
          users: userCount[0].count,
          tenants: tenantCount[0].count,
          orders: orderCount[0].count,
          revenue: parseFloat(revenueRow[0].total),
          pendingOrders: pendingOrders[0].count,
          soldOutProducts: soldOutProducts[0].count,
        },
        productsByCategory,
        contactStatus,
        recentOrders,
        userGrowth,
        orderTrend,
        revenueTrend,
      });
    } catch (error) {
      logger.error('Analytics error:', error.message);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  async getProductAnalytics(req, res) {
    try {
      const [productsOverTime, topCategories, topProducts] = await Promise.all([
        q(`SELECT DATE(created_at) as date, COUNT(*) as count
           FROM products WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           GROUP BY DATE(created_at) ORDER BY date ASC`),
        q(`SELECT c.name as category, COUNT(p.id) as count
           FROM categories c LEFT JOIN products p ON c.id = p.category_id
           GROUP BY c.id, c.name ORDER BY count DESC LIMIT 10`),
        q(`SELECT p.name, p.stock, p.likes_count, p.rating, c.name as category
           FROM products p LEFT JOIN categories c ON p.category_id = c.id
           ORDER BY p.likes_count DESC, p.rating DESC LIMIT 10`),
      ]);
      res.json({ productsOverTime, topCategories, topProducts });
    } catch (error) {
      logger.error('Product analytics error:', error.message);
      res.status(500).json({ error: 'Failed to fetch product analytics' });
    }
  },

  async getContactAnalytics(req, res) {
    try {
      const [contactsOverTime, statusBreakdown, recentActivity] = await Promise.all([
        q(`SELECT DATE(created_at) as date, COUNT(*) as count
           FROM contacts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           GROUP BY DATE(created_at) ORDER BY date ASC`),
        q(`SELECT status, COUNT(*) as count FROM contacts GROUP BY status`),
        q(`SELECT name, email, subject, created_at, status
           FROM contacts ORDER BY created_at DESC LIMIT 10`),
      ]);
      res.json({ contactsOverTime, statusBreakdown, recentActivity });
    } catch (error) {
      logger.error('Contact analytics error:', error.message);
      res.status(500).json({ error: 'Failed to fetch contact analytics' });
    }
  },

  async getOrderAnalytics(req, res) {
    try {
      const [ordersByStatus, orderTrend, topTenantsByOrders] = await Promise.all([
        q(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`),
        q(`SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
           FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           GROUP BY DATE(created_at) ORDER BY date ASC`),
        q(`SELECT u.username, u.store_name, COUNT(DISTINCT o.order_id) as order_count,
                  COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
           FROM users u
           JOIN products p ON p.created_by = u.id
           JOIN order_items oi ON oi.product_id = p.id
           JOIN orders o ON o.order_id = oi.order_id
           WHERE u.role = 'tenant' AND o.status NOT IN ('cancelled')
           GROUP BY u.id ORDER BY revenue DESC LIMIT 5`),
      ]);
      res.json({ ordersByStatus, orderTrend, topTenantsByOrders });
    } catch (error) {
      logger.error('Order analytics error:', error.message);
      res.status(500).json({ error: 'Failed to fetch order analytics' });
    }
  },
};

module.exports = analyticsController;
