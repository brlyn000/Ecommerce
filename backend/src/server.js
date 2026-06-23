const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
require('dotenv').config();
const { createCommentsTable } = require('./migrations/create_comments_table');
const { createNotificationsTable } = require('./migrations/create_notifications_table');
const { addCancellationReason } = require('./migrations/add_cancellation_reason');
const { addGoogleIdToUsers } = require('./migrations/add_google_id_to_users');

const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const carouselRoutes = require('./routes/carousel');
const uploadRoutes = require('./routes/upload');
const contactRoutes = require('./routes/contacts');
const analyticsRoutes = require('./routes/analytics');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const notificationRoutes = require('./routes/notifications');
const orderRoutes = require('./routes/orders');
const tenantAnalyticsRoutes = require('./routes/tenantAnalytics');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = parseInt(process.env.PORT) || 5002;

if (!process.env.JWT_SECRET) {
  logger.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

// CORS harus didaftarkan PERTAMA sebelum rate limiter
// agar response 429 tetap menyertakan CORS header
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Rate limiting (setelah CORS)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads', {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Auth routes with stricter rate limit
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tenant-analytics', tenantAnalyticsRoutes);
app.use('/api/auth', require('./routes/auth')); // authLimiter already applied above
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce API Server', 
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      health: '/api/health'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  await createCommentsTable();
  await createNotificationsTable();
  await addCancellationReason();
  await addGoogleIdToUsers();
}).on('error', (err) => {
  logger.error('Server error:', err);
  process.exit(1);
});