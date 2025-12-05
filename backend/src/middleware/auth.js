const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireTenant = (req, res, next) => {
  if (req.user.role !== 'tenant') {
    return res.status(403).json({ message: 'Tenant access required' });
  }
  next();
};

module.exports = { authenticateToken, requireTenant, requireAuth: authenticateToken };