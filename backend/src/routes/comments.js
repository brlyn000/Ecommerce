const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticateToken = require('../middleware/auth');

router.get('/product/:productId', commentController.getByProductId);
router.post('/', commentController.create);
router.put('/:id', authenticateToken, commentController.update);
router.delete('/:id', authenticateToken, commentController.delete);

module.exports = router;