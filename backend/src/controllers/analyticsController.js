const db = require('../config/database');

const analyticsController = {
  async getOverview(req, res) {
    try {
      // Get total counts
      const [productCount] = await db.execute('SELECT COUNT(*) as count FROM products');
      const [categoryCount] = await db.execute('SELECT COUNT(*) as count FROM categories');
      const [contactCount] = await db.execute('SELECT COUNT(*) as count FROM contacts');
      const [carouselCount] = await db.execute('SELECT COUNT(*) as count FROM carousel_items');

      // Get products by category
      const [productsByCategory] = await db.execute(`
        SELECT c.name as category, COUNT(p.id) as count 
        FROM categories c 
        LEFT JOIN products p ON c.id = p.category_id 
        GROUP BY c.id, c.name
      `);

      // Get recent contacts
      const [recentContacts] = await db.execute(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM contacts 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at) 
        ORDER BY date DESC 
        LIMIT 30
      `);

      // Get contact status distribution
      const [contactStatus] = await db.execute(`
        SELECT status, COUNT(*) as count 
        FROM contacts 
        GROUP BY status
      `);

      res.json({
        overview: {
          products: productCount[0].count,
          categories: categoryCount[0].count,
          contacts: contactCount[0].count,
          carousel: carouselCount[0].count
        },
        productsByCategory,
        recentContacts,
        contactStatus
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getProductAnalytics(req, res) {
    try {
      // Products created over time (last 30 days)
      const [productsOverTime] = await db.execute(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM products 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at) 
        ORDER BY date ASC
      `);

      // Top categories by product count
      const [topCategories] = await db.execute(`
        SELECT c.name as category, COUNT(p.id) as count 
        FROM categories c 
        LEFT JOIN products p ON c.id = p.category_id 
        GROUP BY c.id, c.name 
        ORDER BY count DESC 
        LIMIT 10
      `);

      res.json({
        productsOverTime,
        topCategories
      });
    } catch (error) {
      console.error('Product analytics error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getContactAnalytics(req, res) {
    try {
      // Contacts over time (last 30 days)
      const [contactsOverTime] = await db.execute(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM contacts 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at) 
        ORDER BY date ASC
      `);

      // Contact status breakdown
      const [statusBreakdown] = await db.execute(`
        SELECT status, COUNT(*) as count 
        FROM contacts 
        GROUP BY status
      `);

      // Recent activity
      const [recentActivity] = await db.execute(`
        SELECT name, email, subject, created_at, status 
        FROM contacts 
        ORDER BY created_at DESC 
        LIMIT 10
      `);

      res.json({
        contactsOverTime,
        statusBreakdown,
        recentActivity
      });
    } catch (error) {
      console.error('Contact analytics error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = analyticsController;