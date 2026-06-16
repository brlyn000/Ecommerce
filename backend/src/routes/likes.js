const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const authenticateToken = require('../middleware/auth');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    req.user = null;
    return next();
  }
  // If token exists but invalid/expired, treat as guest (don't return 403)
  const jwt = require('jsonwebtoken');
  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
};

router.post('/products/:productId/toggle', authenticateToken, likeController.toggleLike);
router.get('/products/:productId/status', optionalAuth, likeController.getLikeStatus);

module.exports = router;
