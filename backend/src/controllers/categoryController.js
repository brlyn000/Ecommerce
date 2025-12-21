const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

const categoryController = {
  async getAllCategories(req, res) {
    try {
      const categories = await Category.getAll();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCategoryById(req, res) {
    try {
      const category = await Category.getById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createCategory(req, res) {
    try {
      const categoryId = await Category.create(req.body);
      res.status(201).json({ id: categoryId, message: 'Category created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCategory(req, res) {
    try {
      // Get current category to check for old icon
      const currentCategory = await Category.getById(req.params.id);
      if (currentCategory && req.body.icon && req.body.icon !== currentCategory.icon && currentCategory.icon && !currentCategory.icon.startsWith('http')) {
        const oldIconPath = path.join(__dirname, '../../uploads', path.basename(currentCategory.icon));
        if (fs.existsSync(oldIconPath)) {
          fs.unlinkSync(oldIconPath);
        }
      }
      
      const updated = await Category.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ message: 'Category updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCategory(req, res) {
    try {
      const deleted = await Category.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = categoryController;