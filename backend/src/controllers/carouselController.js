const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const carouselController = {
  async getAll(req, res) {
    try {
      const [rows] = await db.execute('SELECT * FROM carousel_items ORDER BY display_order ASC');
      res.json(rows);
    } catch (error) {
      logger.error('Get carousel error:', error.message);
      res.status(500).json({ error: 'Failed to fetch carousel items' });
    }
  },

  async getById(req, res) {
    try {
      const [rows] = await db.execute('SELECT * FROM carousel_items WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Carousel item not found' });
      res.json(rows[0]);
    } catch (error) {
      logger.error('Get carousel by id error:', error.message);
      res.status(500).json({ error: 'Failed to fetch carousel item' });
    }
  },

  async create(req, res) {
    try {
      const { title, description, image, active, display_order, button_text, button_link } = req.body;

      if (!title || !image) {
        return res.status(400).json({ error: 'Title and image are required' });
      }

      const [result] = await db.execute(
        'INSERT INTO carousel_items (title, description, image, active, display_order, button_text, button_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, description || null, image, active ?? 1, display_order || 1, button_text || null, button_link || null]
      );

      res.status(201).json({ id: result.insertId, message: 'Carousel item created successfully' });
    } catch (error) {
      logger.error('Create carousel error:', error.message);
      res.status(500).json({ error: 'Failed to create carousel item' });
    }
  },

  async update(req, res) {
    try {
      const { title, description, image, active, display_order, button_text, button_link } = req.body;

      const [current] = await db.execute('SELECT image FROM carousel_items WHERE id = ?', [req.params.id]);
      if (current.length === 0) return res.status(404).json({ error: 'Carousel item not found' });

      if (image && image !== current[0].image && current[0].image && !current[0].image.startsWith('http')) {
        const oldPath = path.join(__dirname, '../../public/uploads/carousel', path.basename(current[0].image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const [result] = await db.execute(
        'UPDATE carousel_items SET title = ?, description = ?, image = ?, active = ?, display_order = ?, button_text = ?, button_link = ? WHERE id = ?',
        [title, description || null, image, active, display_order, button_text || null, button_link || null, req.params.id]
      );

      if (result.affectedRows === 0) return res.status(404).json({ error: 'Carousel item not found' });

      res.json({ message: 'Carousel item updated successfully' });
    } catch (error) {
      logger.error('Update carousel error:', error.message);
      res.status(500).json({ error: 'Failed to update carousel item' });
    }
  },

  async delete(req, res) {
    try {
      const [item] = await db.execute('SELECT image FROM carousel_items WHERE id = ?', [req.params.id]);

      if (item.length > 0 && item[0].image && !item[0].image.startsWith('http')) {
        const imgPath = path.join(__dirname, '../../public/uploads/carousel', path.basename(item[0].image));
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }

      const [result] = await db.execute('DELETE FROM carousel_items WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Carousel item not found' });

      res.json({ message: 'Carousel item deleted successfully' });
    } catch (error) {
      logger.error('Delete carousel error:', error.message);
      res.status(500).json({ error: 'Failed to delete carousel item' });
    }
  },
};

module.exports = carouselController;
