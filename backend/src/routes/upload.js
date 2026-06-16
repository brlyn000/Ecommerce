const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Jimp, JimpMime } = require('jimp');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const logger = require('../utils/logger');

const UPLOAD_DIRS = {
  qris: path.join(__dirname, '../../public/uploads/qris'),
  products: path.join(__dirname, '../../public/uploads/products'),
  carousel: path.join(__dirname, '../../public/uploads/carousel'),
  ktm: path.join(__dirname, '../../public/uploads/ktm'),
};

Object.values(UPLOAD_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage: memoryStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });

const compressAndSave = async (buffer, outputPath, type) => {
  const MAX_WIDTH = type === 'qris' ? 500 : 1200;
  const QUALITY = type === 'qris' ? 90 : 80;

  const image = await Jimp.fromBuffer(buffer);
  if (image.bitmap.width > MAX_WIDTH) {
    image.resize({ w: MAX_WIDTH });
  }
  const compressed = await image.getBuffer(JimpMime.jpeg, { quality: QUALITY });
  fs.writeFileSync(outputPath, compressed);
};

const handleUpload = (type) => async (req, res) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dir = UPLOAD_DIRS[type] || UPLOAD_DIRS.products;
    const files = req.file ? [req.file] : req.files;
    const urls = [];

    for (const file of files) {
      const filename = `${type}-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      const outputPath = path.join(dir, filename);
      await compressAndSave(file.buffer, outputPath, type);
      urls.push(`/uploads/${type}/${filename}`);
    }

    const imageUrl = urls[0];
    res.json({
      success: true,
      imageUrl,
      url: imageUrl,
      imageUrls: urls,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    logger.error('Upload error:', error.message);
    res.status(500).json({ error: 'Upload failed' });
  }
};

router.post('/qris', authenticateToken, upload.single('qrisImage'), handleUpload('qris'));
router.post('/products', authenticateToken, upload.array('images', 5), handleUpload('products'));
router.post('/product', authenticateToken, upload.single('image'), handleUpload('products'));
router.post('/carousel', authenticateToken, upload.single('image'), handleUpload('carousel'));
router.post('/ktm', upload.single('ktm'), handleUpload('ktm'));

router.post('/single', authenticateToken, upload.single('image'), (req, res) => {
  req.params.type = req.query.type || 'products';
  return handleUpload(req.params.type)(req, res);
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large (max 10MB)' });
  }
  logger.error('Upload middleware error:', error.message);
  res.status(400).json({ error: error.message });
});

module.exports = router;
