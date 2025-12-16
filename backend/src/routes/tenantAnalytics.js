const express = require('express');
const router = express.Router();
const tenantAnalyticsController = require('../controllers/tenantAnalyticsController');
const authenticateToken = require('../middleware/auth');

router.get('/products', authenticateToken, tenantAnalyticsController.getProductAnalytics);
router.get('/overview', authenticateToken, tenantAnalyticsController.getOverviewStats);
router.get('/charts', authenticateToken, tenantAnalyticsController.getChartData);

module.exports = router;