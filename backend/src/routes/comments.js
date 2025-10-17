const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/product/:productId', commentController.getByProductId);
router.post('/', commentController.create);
router.delete('/:id', commentController.delete);

module.exports = router;