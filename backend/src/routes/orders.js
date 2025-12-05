const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireTenant } = require('../middleware/auth');

router.post('/', authenticateToken, orderController.createOrder);
router.get('/tenant', authenticateToken, orderController.getTenantOrders);
router.put('/:order_id/status', authenticateToken, orderController.updateOrderStatus);
router.put('/:order_id/received', authenticateToken, orderController.confirmOrderReceived);
router.put('/:order_id/confirm', authenticateToken, orderController.confirmOrderReceived);
router.post('/auto-complete', orderController.autoCompleteOrders);
router.get('/user', authenticateToken, orderController.getUserOrders);

module.exports = router;