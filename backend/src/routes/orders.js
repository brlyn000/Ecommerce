const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middleware/auth');
const { validate, rules } = require('../middleware/validate');

router.post('/', authenticateToken, rules.createOrder, validate, orderController.createOrder);
router.get('/admin/all', authenticateToken, orderController.getAllOrdersAdmin);
router.delete('/admin/:order_id', authenticateToken, orderController.deleteOrderAdmin);
router.get('/tenant', authenticateToken, orderController.getTenantOrders);
router.get('/user', authenticateToken, orderController.getUserOrders);
router.put('/:order_id/status', authenticateToken, orderController.updateOrderStatus);
router.put('/:order_id/received', authenticateToken, orderController.confirmOrderReceived);
router.put('/:order_id/confirm', authenticateToken, orderController.confirmOrderReceived);
router.put('/:order_id/cancel', authenticateToken, orderController.cancelOrder);
router.post('/auto-complete', orderController.autoCompleteOrders);

module.exports = router;
