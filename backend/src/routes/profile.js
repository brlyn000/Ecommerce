const express = require('express');
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// CREATE - Register new user profile
router.post('/', async (req, res) => {
  try {
    const { username, email, password, full_name, phone, address } = req.body;
    
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, full_name, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, phone, address]
    );
    
    res.status(201).json({ 
      message: 'Profile created successfully',
      userId: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// READ - Get current user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email, full_name, phone, address, store_name, role, status, payment_methods, contact_info, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    user.payment_methods = user.payment_methods ? JSON.parse(user.payment_methods) : null;
    user.contact_info = user.contact_info ? JSON.parse(user.contact_info) : null;
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ - Get user profile by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const [users] = await db.execute(
      'SELECT id, username, email, full_name, phone, address, store_name, role, status, payment_methods, contact_info, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    user.payment_methods = user.payment_methods ? JSON.parse(user.payment_methods) : null;
    user.contact_info = user.contact_info ? JSON.parse(user.contact_info) : null;
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Update user profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { full_name, phone, address, email, username, store_name } = req.body;
    
    await db.execute(
      'UPDATE users SET full_name = ?, phone = ?, address = ?, email = ?, username = ?, store_name = ? WHERE id = ?',
      [full_name, phone, address, email, username, store_name, req.user.id]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email or username already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const [users] = await db.execute(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const bcrypt = require('bcrypt');
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Deactivate user profile
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await db.execute(
      'UPDATE users SET status = "inactive" WHERE id = ?',
      [req.user.id]
    );
    
    res.json({ message: 'Profile deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Permanently delete user profile (admin only)
router.delete('/:id/permanent', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await db.execute(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ message: 'Profile permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Profile route is working' });
});

module.exports = router;