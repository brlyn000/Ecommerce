const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

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
      const productData = { ...req.body, created_by: req.user?.id };
      const productId = await Product.create(productData);
      res.status(201).json({ id: productId, message: 'Product created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getUserProducts(req, res) {
    try {
      const products = await Product.getByUserId(req.user.id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTenantProducts(req, res) {
    try {
      const products = await Product.getByUserId(req.params.tenantId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      // Check if product belongs to user
      const product = await Product.getById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (req.user.role !== 'admin' && product.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Delete old image if new image is uploaded
      if (req.body.image && req.body.image !== product.image && product.image && !product.image.startsWith('http')) {
        const oldImagePath = path.join(__dirname, '../../uploads', path.basename(product.image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      const updated = await Product.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product updated successfully' });
    } catch (error) {
      logger.error('Product update error:', error.message);
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  async searchProducts(req, res) {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) return res.json([]);
      const products = await Product.search(q.trim());
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async trackClick(req, res) {
    try {
      await Product.trackClick(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTrendingSearches(req, res) {
    try {
      const trending = await Product.getTrendingSearches();
      res.json(trending);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      // Check if product belongs to user
      const product = await Product.getById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (req.user.role !== 'admin' && product.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Delete image file if exists
      if (product.image && !product.image.startsWith('http')) {
        const imagePath = path.join(__dirname, '../../uploads', path.basename(product.image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
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