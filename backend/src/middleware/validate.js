const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }
  next();
};

const rules = {
  register: [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  login: [
    body('username').trim().notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  createProduct: [
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Product name is required (max 255 chars)'),
    body('price').toFloat().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').optional({ checkFalsy: true }).toInt().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category_id').toInt().isInt({ min: 1 }).withMessage('Valid category ID required'),
  ],
  createOrder: [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.id').isInt({ min: 1 }).withMessage('Valid product ID required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('total').isFloat({ min: 0.01 }).withMessage('Valid total amount required'),
  ],
  createComment: [
    body('product_id').isInt({ min: 1 }).withMessage('Valid product ID required'),
    body('comment').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  ],
  idParam: [
    param('id').isInt({ min: 1 }).withMessage('Valid ID required'),
  ],
};

module.exports = { validate, rules };
