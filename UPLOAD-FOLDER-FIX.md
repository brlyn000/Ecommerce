# ✅ Upload Folder Fix

## 🐛 Masalah yang Diperbaiki:
**Upload gambar masuk ke folder `general` bukan `products`**

## 🔧 Penyebab Masalah:
- Multer menggunakan `req.body.type` untuk menentukan folder
- FormData mengirim field `type` setelah file
- Multer sudah memproses file sebelum `req.body.type` tersedia

## ✅ Solusi yang Diterapkan:

### 1. **Backend Upload Route Fix**:
```javascript
// Menggunakan query parameter instead of body
const uploadType = req.query.type || req.body.type || 'products';

// Dynamic storage berdasarkan type
const dynamicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, uploadType);
    // ...
  }
});
```

### 2. **Frontend API Call Fix**:
```javascript
// Mengirim type sebagai query parameter
const response = await fetch(`${API_BASE_URL}/upload/single?type=${type}`, {
  method: 'POST',
  body: formData
});
```

### 3. **Default ke Products**:
```javascript
async uploadFile(file, type = 'products') {
  // Default type adalah 'products' bukan 'general'
}
```

### 4. **Port Update**:
- Backend: `localhost:5005`
- Frontend: Update semua URL references

## 🚀 Hasil:

### ✅ **Upload Structure**:
```
backend/
  public/
    uploads/
      products/           ← ✅ Gambar produk masuk di sini
        image-123.jpg
        image-456.jpg
      general/            ← Upload lainnya
```

### ✅ **URL Format**:
- Upload URL: `/uploads/products/image-123456.jpg`
- Full URL: `http://localhost:5005/uploads/products/image-123456.jpg`

## 🧪 Testing:
1. Upload gambar di dashboard → ✅ Masuk ke `/uploads/products/`
2. API response → ✅ URL correct: `/uploads/products/filename.jpg`
3. Image display → ✅ Gambar tampil dengan benar

## 📁 File Changes:
- `backend/src/routes/upload.js` - Dynamic storage dengan query parameter
- `src/services/api.js` - Query parameter untuk type
- `.env` files - Port update ke 5005

## 🎯 Status: **FIXED** ✅
Upload gambar sekarang masuk ke folder `products` dengan benar!