const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// Ensure uploads directories exist
const qrisUploadsDir = path.join(__dirname, '../../public/uploads/qris');
const productUploadsDir = path.join(__dirname, '../../public/uploads/products');

if (!fs.existsSync(qrisUploadsDir)) {
  fs.mkdirSync(qrisUploadsDir, { recursive: true });
}
if (!fs.existsSync(productUploadsDir)) {
  fs.mkdirSync(productUploadsDir, { recursive: true });
}

// Configure multer for QRIS upload
const qrisStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, qrisUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'qris-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for product upload
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const qrisUpload = multer({
  storage: qrisStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

const productUpload = multer({
  storage: productStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for products
  fileFilter: fileFilter
});

// Upload QRIS image
router.post('/qris', authenticateToken, qrisUpload.single('qrisImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/qris/${req.file.filename}`;
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      message: 'QRIS image uploaded successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload product images
router.post('/products', authenticateToken, productUpload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
    res.json({ 
      success: true, 
      imageUrls: imageUrls,
      message: 'Product images uploaded successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload single product image
router.post('/product', authenticateToken, productUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      message: 'Product image uploaded successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload single file (legacy endpoint)
router.post('/single', authenticateToken, (req, res) => {
  const type = req.query.type || 'products';
  const upload = type === 'qris' ? qrisUpload : productUpload;
  
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = type === 'qris' ? 'qris' : 'products';
    const imageUrl = `/uploads/${folder}/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      message: 'File uploaded successfully' 
    });
  });
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

module.exports = router;