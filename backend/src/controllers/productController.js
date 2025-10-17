const Product = require('../models/Product');

const productController = {
  async getAllProducts(req, res) {
    try {
      const products = await Product.getAll();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProductById(req, res) {
    try {
      const product = await Product.getById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProductsByCategory(req, res) {
    try {
      const products = await Product.getByCategory(req.params.categoryId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createProduct(req, res) {
    try {
      const productId = await Product.create(req.body);
      res.status(201).json({ id: productId, message: 'Product created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const updated = await Product.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product updated successfully' });
    } catch (error) {
      console.error('Product update error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const deleted = await Product.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = productController;