const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createCommentsTable } = require('./migrations/create_comments_table');
const { createNotificationsTable } = require('./migrations/create_notifications_table');

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

const app = express();
const PORT = parseInt(process.env.PORT) || 5002 ;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5006'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads', {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

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
app.use('/api/auth', require('./routes/auth'));

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
  console.log(`Server running on http://localhost:${PORT}`);
  await createCommentsTable();
  await createNotificationsTable();
}).on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});