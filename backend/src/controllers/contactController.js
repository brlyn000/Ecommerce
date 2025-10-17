const db = require('../config/database');

const contactController = {
  async getAll(req, res) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM contacts ORDER BY created_at DESC'
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { name, email, subject, message } = req.body;
      
      const [result] = await db.execute(
        'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [name, email, subject || '', message]
      );
      
      res.status(201).json({ 
        id: result.insertId, 
        message: 'Contact message sent successfully' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      
      const [result] = await db.execute(
        'UPDATE contacts SET status = ? WHERE id = ?',
        [status, req.params.id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      res.json({ message: 'Contact status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const [result] = await db.execute(
        'DELETE FROM contacts WHERE id = ?',
        [req.params.id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = contactController;