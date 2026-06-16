const db = require('../config/database');
const logger = require('../utils/logger');

const ALLOWED_STATUSES = ['pending', 'read', 'resolved'];

const contactController = {
  async getAll(req, res) {
    try {
      const [rows] = await db.execute('SELECT * FROM contacts ORDER BY created_at DESC');
      res.json(rows);
    } catch (error) {
      logger.error('Get contacts error:', error.message);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  },

  async create(req, res) {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
      }

      const [result] = await db.execute(
        'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [String(name).slice(0, 100), String(email).slice(0, 255), String(subject || '').slice(0, 255), String(message).slice(0, 2000)]
      );

      res.status(201).json({ id: result.insertId, message: 'Contact message sent successfully' });
    } catch (error) {
      logger.error('Create contact error:', error.message);
      res.status(500).json({ error: 'Failed to send contact message' });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;

      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
      }

      const [result] = await db.execute(
        'UPDATE contacts SET status = ? WHERE id = ?',
        [status, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json({ message: 'Contact status updated successfully' });
    } catch (error) {
      logger.error('Update contact status error:', error.message);
      res.status(500).json({ error: 'Failed to update contact status' });
    }
  },

  async delete(req, res) {
    try {
      const [result] = await db.execute('DELETE FROM contacts WHERE id = ?', [req.params.id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      logger.error('Delete contact error:', error.message);
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  },
};

module.exports = contactController;
