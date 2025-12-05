const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { authenticateToken } = require('../middleware/auth');

// Toggle like/unlike for a product
router.post('/products/:productId/toggle', authenticateToken, likeController.toggleLike);

// Get like status for a product (public for count, auth for user status)
router.get('/products/:productId/status', (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authenticateToken(req, res, next);
  } else {
    req.user = null;
    next();
  }
}, likeController.getLikeStatus);

module.exports = router;