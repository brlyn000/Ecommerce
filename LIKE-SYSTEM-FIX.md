# Fix Bug Sistem Like

## Masalah
User yang sudah login tetap diminta login saat menekan tombol like.

## Penyebab
Inkonsistensi penggunaan token:
- Frontend menggunakan `adminToken` untuk semua operasi
- Sistem like mengharapkan token user biasa
- Tidak ada fallback untuk `userToken`

## Solusi
Menambahkan fallback token di semua komponen:

### File yang Diperbaiki:

1. **CardProduct.jsx**
   - `handleLikeAndWishlist()` - Tambah fallback `userToken`
   - Tombol add to cart - Tambah fallback `userToken`

2. **ProductDetail.jsx**
   - `handleLikeAndWishlist()` - Tambah fallback `userToken`
   - Tombol ADD TO CART - Tambah fallback `userToken`
   - Tombol ORDER NOW - Tambah fallback `userToken`
   - API calls untuk order dan notification - Tambah fallback `userToken`

3. **api.js**
   - `toggleLike()` - Tambah fallback `userToken`
   - `getLikeStatus()` - Tambah fallback `userToken`

## Perubahan Kode
```javascript
// Sebelum
const token = localStorage.getItem('adminToken');

// Sesudah
const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
```

## Testing
1. Login sebagai user biasa
2. Coba like produk di halaman utama
3. Coba like produk di halaman detail
4. Pastikan tidak ada prompt login lagi
5. Cek notifikasi di dashboard tenant

## Status
✅ Bug diperbaiki - Sistem like sekarang bekerja untuk semua jenis user