const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validate, rules } = require('../middleware/validate');
const router = express.Router();

const ALLOWED_ROLES = ['user', 'tenant'];
const TOKEN_EXPIRY = '24h';

// Register
router.post('/register', rules.register, validate, async (req, res) => {
  try {
    const { username, email, password, role, full_name, phone, address, payment_methods, nim, student_card_image } = req.body;

    const safeRole = ALLOWED_ROLES.includes(role) ? role : 'user';

    const [existing] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.execute(
      'INSERT INTO users (username, email, password, role, full_name, phone, address, payment_methods, nim, student_card_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, safeRole, full_name || null, phone || null, address || null, payment_methods || null, nim || null, student_card_image || null]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', rules.login, validate, async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.execute(
      'SELECT id, username, email, password, role, full_name FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
