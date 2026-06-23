const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticateToken = require('../middleware/auth');
const { validate, rules } = require('../middleware/validate');

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/trending-searches', productController.getTrendingSearches);
router.post('/:id/track-click', productController.trackClick);
router.get('/user/my-products', authenticateToken, productController.getUserProducts);
router.get('/tenant/:tenantId', productController.getTenantProducts);
router.get('/:id', productController.getProductById);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.post('/', authenticateToken, rules.createProduct, validate, productController.createProduct);
router.put('/:id', authenticateToken, rules.createProduct, validate, productController.updateProduct);
router.delete('/:id', authenticateToken, productController.deleteProduct);

module.exports = router;
