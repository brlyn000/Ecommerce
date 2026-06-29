const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const https = require('https');
const db = require('../config/database');
const { validate, rules } = require('../middleware/validate');
const { sendResetPasswordEmail } = require('../utils/mailer');
const router = express.Router();

const ALLOWED_ROLES = ['user', 'tenant'];
const TOKEN_EXPIRY = '24h';

// Helper: exchange Google code for tokens + user info
async function getGoogleUser(code, redirectUri) {
  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok || tokens.error) throw new Error(tokens.error_description || 'Token exchange failed');

  // Get user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const googleUser = await userRes.json();
  if (!userRes.ok) throw new Error('Failed to get Google user info');
  return googleUser;
}

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

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.json({ message: 'Jika email terdaftar, link reset password telah dikirim.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    // Hapus token lama untuk user ini
    await db.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [users[0].id]);

    // Simpan token baru
    await db.execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [users[0].id, token, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

    if (smtpConfigured) {
      try {
        await sendResetPasswordEmail(email, resetUrl);
        return res.json({ message: 'Jika email terdaftar, link reset password telah dikirim.' });
      } catch (mailErr) {
        console.error('Email send failed:', mailErr.message);
        // Fallback ke dev_reset_url jika email gagal
        return res.json({
          message: 'Jika email terdaftar, link reset password telah dikirim.',
          dev_reset_url: resetUrl,
        });
      }
    }

    // SMTP belum dikonfigurasi — tampilkan dev link
    res.json({
      message: 'Jika email terdaftar, link reset password telah dikirim.',
      dev_reset_url: resetUrl,
    });
  } catch {
    res.status(500).json({ message: 'Failed to process request' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token dan password wajib diisi' });
    if (password.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter' });

    const [tokens] = await db.execute(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, tokens[0].user_id]);
    await db.execute('UPDATE password_reset_tokens SET used = 1 WHERE token = ?', [token]);

    res.json({ message: 'Password berhasil direset' });
  } catch {
    res.status(500).json({ message: 'Failed to reset password' });
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

// Google OAuth — exchange code for JWT
router.post('/google/code', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    if (!code || !redirect_uri) return res.status(400).json({ message: 'code and redirect_uri required' });
    if (!process.env.GOOGLE_CLIENT_SECRET) return res.status(500).json({ message: 'Google auth not configured' });

    const googleUser = await getGoogleUser(code, redirect_uri);
    const { id: google_id, email, name, picture } = googleUser;

    // Cari user berdasarkan google_id atau email
    const [users] = await db.execute(
      'SELECT id, username, email, role, full_name, google_id FROM users WHERE google_id = ? OR email = ?',
      [google_id, email]
    );

    let user;
    if (users.length > 0) {
      user = users[0];
      // Update google_id jika belum tersimpan
      if (!user.google_id) {
        await db.execute('UPDATE users SET google_id = ? WHERE id = ?', [google_id, user.id]);
      }
    } else {
      // User baru — perlu complete profile (role selection)
      return res.json({
        needs_completion: true,
        google_data: { google_id, email, name, picture },
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Google login failed' });
  }
});

// Google OAuth — complete registration (new user)
router.post('/google/complete', async (req, res) => {
  try {
    const { google_id, email, full_name, username, phone, role, address, store_name, nim, student_card_image } = req.body;

    if (!google_id || !email || !username || !phone || !role)
      return res.status(400).json({ message: 'Data tidak lengkap. Username dan No. HP wajib diisi.' });
    if (!ALLOWED_ROLES.includes(role))
      return res.status(400).json({ message: 'Role tidak valid' });
    if (role === 'tenant' && (!nim || !student_card_image))
      return res.status(400).json({ message: 'NIM dan KTM wajib diisi untuk Tenant' });

    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR google_id = ? OR username = ?',
      [email, google_id, username]
    );
    if (existing.length > 0) return res.status(400).json({ message: 'Email atau username sudah terdaftar' });

    const randomPassword = await bcrypt.hash(Math.random().toString(36), 12);
    const finalName = full_name || username;
    const storeNameValue = role === 'tenant' ? (store_name || null) : null;
    const nimValue = role === 'tenant' ? (nim || null) : null;
    const ktmValue = role === 'tenant' ? (student_card_image || null) : null;

    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, role, full_name, phone, address, google_id, store_name, nim, student_card_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, randomPassword, role, finalName, phone, address || null, google_id, storeNameValue, nimValue, ktmValue]
    );

    const token = jwt.sign(
      { id: result.insertId, username, role },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      token,
      user: { id: result.insertId, username, email, role, full_name: finalName, store_name: storeNameValue },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

module.exports = router;
