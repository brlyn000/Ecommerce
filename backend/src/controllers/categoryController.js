const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const categoryController = {
  async getAllCategories(req, res) {
    try {
      const categories = await Category.getAll();
      res.json(categories);
    } catch (error) {
      logger.error('Get categories error:', error.message);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  async getCategoryById(req, res) {
    try {
      const category = await Category.getById(req.params.id);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      res.json(category);
    } catch (error) {
      logger.error('Get category by id error:', error.message);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  },

  async createCategory(req, res) {
    try {
      if (!req.body.name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      const categoryId = await Category.create(req.body);
      res.status(201).json({ id: categoryId, message: 'Category created successfully' });
    } catch (error) {
      logger.error('Create category error:', error.message);
      res.status(500).json({ error: 'Failed to create category' });
    }
  },

  async updateCategory(req, res) {
    try {
      const currentCategory = await Category.getById(req.params.id);
      if (!currentCategory) return res.status(404).json({ error: 'Category not found' });

      if (req.body.icon && req.body.icon !== currentCategory.icon && currentCategory.icon && !currentCategory.icon.startsWith('http')) {
        const oldIconPath = path.join(__dirname, '../../public/uploads', path.basename(currentCategory.icon));
        if (fs.existsSync(oldIconPath)) fs.unlinkSync(oldIconPath);
      }

      const updated = await Category.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Category not found' });

      res.json({ message: 'Category updated successfully' });
    } catch (error) {
      logger.error('Update category error:', error.message);
      res.status(500).json({ error: 'Failed to update category' });
    }
  },

  async deleteCategory(req, res) {
    try {
      const deleted = await Category.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Category not found' });
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      logger.error('Delete category error:', error.message);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  },
};

module.exports = categoryController;
