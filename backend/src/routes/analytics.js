const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', analyticsController.getOverview);
router.get('/products', analyticsController.getProductAnalytics);
router.get('/contacts', analyticsController.getContactAnalytics);

module.exports = router;