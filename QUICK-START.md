# Quick Start Guide - E-commerce Dashboard dengan MySQL

## 🚀 Cara Cepat Menjalankan Aplikasi

### 1. Setup Otomatis (Recommended)
```bash
./start-with-db.sh
```

### 2. Setup Manual

#### A. Backend Setup
```bash
cd backend
npm install
npm run setup-db    # Setup database dan tabel
npm run migrate-db  # Migrasi struktur tabel (jika diperlukan)
npm run test-db     # Test koneksi database
npm run dev         # Jalankan server backend
```

#### B. Frontend Setup
```bash
npm install
npm run dev         # Jalankan server frontend
```

## 🗄️ Konfigurasi Database

### Prerequisites
- MySQL Server harus sudah terinstall dan berjalan
- Buat user MySQL dengan kredensial sesuai file `.env`

### File `.env` Backend
```
PORT=5002
DB_HOST=localhost
DB_USER=brillian
DB_PASSWORD=passwordku
DB_NAME=e-commerce
```

### File `.env` Frontend
```
VITE_API_BASE_URL=http://localhost:5003/api
VITE_SERVER_URL=http://localhost:5003
```

## 📊 Fitur Dashboard yang Tersedia

### Product Manager
- ✅ Tampilkan semua produk dari database MySQL
- ✅ Tambah produk baru
- ✅ Edit produk yang sudah ada
- ✅ Hapus produk
- ✅ Upload gambar produk
- ✅ Filter berdasarkan kategori
- ✅ Pencarian produk

### Database Schema
- **Categories**: id, name, description, icon, link
- **Products**: id, name, description, price, image, rating, stock_status, category_id, discount, whatsapp
- **Carousel**: id, title, description, image, active, display_order

## 🔧 Troubleshooting

### Database Connection Error
1. Pastikan MySQL server berjalan
2. Cek kredensial di file `.env`
3. Jalankan `npm run test-db` untuk verifikasi

### Port Sudah Digunakan
- Backend otomatis mencari port yang tersedia (5002, 5003, dst.)
- Update file `.env` frontend jika port berubah

### Tabel Tidak Ditemukan
```bash
cd backend
npm run setup-db    # Buat tabel baru
npm run migrate-db  # Update struktur tabel yang ada
```

## 🌐 URL Akses

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5003 (atau port yang tersedia)
- **API Documentation**: http://localhost:5003/api

## 📝 API Endpoints

### Products
- `GET /api/products` - Semua produk
- `GET /api/products/:id` - Produk berdasarkan ID
- `POST /api/products` - Tambah produk baru
- `PUT /api/products/:id` - Update produk
- `DELETE /api/products/:id` - Hapus produk

### Categories
- `GET /api/categories` - Semua kategori
- `POST /api/categories` - Tambah kategori baru

### Upload
- `POST /api/upload/single` - Upload gambar tunggal

## ✨ Sample Data

Database akan otomatis terisi dengan:
- 5 kategori sample (Tools, Food, Digital Product, Fashion, Books)
- 4 produk sample dengan berbagai kategori
- Data carousel untuk homepage

Sekarang dashboard Anda sudah terhubung dengan database MySQL dan siap digunakan! 🎉