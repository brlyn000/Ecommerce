const db = require('../config/database');

const carouselController = {
  // Get all carousel items
  async getAll(req, res) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM carousel_items ORDER BY display_order ASC'
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get carousel item by ID
  async getById(req, res) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM carousel_items WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Carousel item not found' });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new carousel item
  async create(req, res) {
    try {
      const { title, description, image, active, display_order, button_text, button_link } = req.body;
      
      const [result] = await db.execute(
        'INSERT INTO carousel_items (title, description, image, active, display_order, button_text, button_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, description, image, active || 1, display_order || 1, button_text, button_link]
      );
      
      res.status(201).json({ 
        id: result.insertId, 
        message: 'Carousel item created successfully' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update carousel item
  async update(req, res) {
    try {
      const { title, description, image, active, display_order, button_text, button_link } = req.body;
      
      const [result] = await db.execute(
        'UPDATE carousel_items SET title = ?, description = ?, image = ?, active = ?, display_order = ?, button_text = ?, button_link = ? WHERE id = ?',
        [title, description, image, active, display_order, button_text, button_link, req.params.id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Carousel item not found' });
      }
      
      res.json({ message: 'Carousel item updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete carousel item
  async delete(req, res) {
    try {
      const [result] = await db.execute(
        'DELETE FROM carousel_items WHERE id = ?',
        [req.params.id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Carousel item not found' });
      }
      
      res.json({ message: 'Carousel item deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = carouselController;