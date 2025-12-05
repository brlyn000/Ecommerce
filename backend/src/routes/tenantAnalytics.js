const express = require('express');
const router = express.Router();
const tenantAnalyticsController = require('../controllers/tenantAnalyticsController');
const { authenticateToken, requireTenant } = require('../middleware/auth');

router.get('/products', authenticateToken, requireTenant, tenantAnalyticsController.getProductAnalytics);
router.get('/overview', authenticateToken, requireTenant, tenantAnalyticsController.getOverviewStats);
router.get('/charts', authenticateToken, requireTenant, tenantAnalyticsController.getChartData);

module.exports = router;