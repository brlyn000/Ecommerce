const express = require('express');
const db = require('../config/database');
const bcrypt = require('bcrypt');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

router.get('/:userId/payment-methods', async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT payment_methods, contact_info FROM users WHERE id = ?',
      [req.params.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const paymentMethods = users[0].payment_methods ? JSON.parse(users[0].payment_methods) : null;
    const contactInfo = users[0].contact_info ? JSON.parse(users[0].contact_info) : null;
    res.json({ payment_methods: paymentMethods, contact_info: contactInfo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const { payment_methods } = req.body;
    
    await db.execute(
      'UPDATE users SET payment_methods = ? WHERE id = ?',
      [JSON.stringify(payment_methods), req.user.id]
    );
    
    res.json({ message: 'Payment methods updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/contact-info', authenticateToken, async (req, res) => {
  try {
    const { contact_info } = req.body;
    
    await db.execute(
      'UPDATE users SET contact_info = ? WHERE id = ?',
      [JSON.stringify(contact_info), req.user.id]
    );
    
    res.json({ message: 'Contact info updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email, full_name, phone, address, payment_methods, contact_info FROM users WHERE id = ?',
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

// Get all tenants (Public access)
router.get('/tenants', async (req, res) => {
  try {
    const [tenants] = await db.execute(
      `SELECT id, username, email, store_name as business_name, phone, address, status, created_at 
       FROM users WHERE role = 'tenant' ORDER BY created_at DESC`
    );
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single tenant (Public)
router.get('/tenants/:id', async (req, res) => {
  try {
    const [tenant] = await db.execute(
      `SELECT id, username, email, store_name as business_name, phone, address, status, created_at 
       FROM users WHERE id = ? AND role = 'tenant'`,
      [req.params.id]
    );
    
    if (tenant.length === 0) {
      return res.status(404).json({ message: 'Tenant tidak ditemukan' });
    }
    
    res.json(tenant[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new tenant (Admin only)
router.post('/tenants', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, email, password, business_name, phone, address, status } = req.body;
    
    // Check if username or email already exists
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah digunakan' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new tenant
    const [result] = await db.execute(
      `INSERT INTO users (username, email, password, role, store_name, phone, address, status) 
       VALUES (?, ?, ?, 'tenant', ?, ?, ?, ?)`,
      [username, email, hashedPassword, business_name || null, phone || null, address || null, status || 'active']
    );
    
    res.status(201).json({ 
      message: 'Tenant berhasil ditambahkan',
      id: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update tenant (Admin only)
router.put('/tenants/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, email, password, business_name, phone, address, status } = req.body;
    const tenantId = req.params.id;
    
    // Check if tenant exists
    const [tenant] = await db.execute(
      'SELECT id FROM users WHERE id = ? AND role = "tenant"',
      [tenantId]
    );
    
    if (tenant.length === 0) {
      return res.status(404).json({ message: 'Tenant tidak ditemukan' });
    }
    
    // Check if username or email is taken by another user
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, tenantId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah digunakan' });
    }
    
    // Build update query
    let updateQuery = 'UPDATE users SET username = ?, email = ?, store_name = ?, phone = ?, address = ?, status = ?';
    let params = [username, email, business_name || null, phone || null, address || null, status || 'active'];
    
    // Add password to update if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(tenantId);
    
    await db.execute(updateQuery, params);
    
    res.json({ message: 'Tenant berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete tenant (Admin only)
router.delete('/tenants/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const tenantId = req.params.id;
    
    // Check if tenant exists
    const [tenant] = await db.execute(
      'SELECT id FROM users WHERE id = ? AND role = "tenant"',
      [tenantId]
    );
    
    if (tenant.length === 0) {
      return res.status(404).json({ message: 'Tenant tidak ditemukan' });
    }
    
    // Delete tenant
    await db.execute('DELETE FROM users WHERE id = ?', [tenantId]);
    
    res.json({ message: 'Tenant berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (Admin only)
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role, status } = req.body;
    
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah digunakan' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.execute(
      'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user', status || 'active']
    );
    
    res.status(201).json({ message: 'User berhasil ditambahkan' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role, status } = req.body;
    const userId = req.params.id;
    
    const [user] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, userId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah digunakan' });
    }
    
    let updateQuery = 'UPDATE users SET username = ?, email = ?, role = ?, status = ?';
    let params = [username, email, role, status];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(userId);
    
    await db.execute(updateQuery, params);
    
    res.json({ message: 'User berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [user] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;