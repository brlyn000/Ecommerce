# Debug Notifikasi Tenant

## Masalah
Notifikasi tidak muncul di dashboard tenant setelah user melakukan like.

## Penyebab yang Ditemukan
1. ❌ Field mapping salah: `read_status` vs `is_read`
2. ❌ Token tidak konsisten: perlu fallback `tenantToken`
3. ❌ Data structure tidak sesuai antara backend dan frontend

## Perbaikan yang Dilakukan

### 1. API Service (api.js)
```javascript
// Tambah fallback token
const token = localStorage.getItem('adminToken') || localStorage.getItem('tenantToken');

// Return array langsung
return response.notifications || [];
```

### 2. Backend Routes (notifications.js)
```javascript
// Tambah filter berdasarkan type
if (type) {
  query += ` AND n.type = ?`;
  params.push(type);
}
```

### 3. TenantDashboard.jsx
```javascript
// Perbaiki field mapping
read: notif.is_read  // bukan read_status
customerName: notif.data ? notif.data.customer_name : 'Unknown'
```

### 4. Like Controller (likeController.js)
```javascript
// Hapus kolom user_id yang tidak ada
'INSERT INTO notifications (type, tenant_id, product_id, message, data) VALUES (?, ?, ?, ?, ?)'
```

## Testing
1. ✅ Tabel notifications struktur benar
2. ✅ Backend dapat membuat notifikasi
3. ✅ API endpoint berfungsi
4. 🔄 Frontend perlu di-test ulang

## Langkah Selanjutnya
1. Restart frontend
2. Login sebagai tenant
3. Login sebagai user di tab lain
4. Like produk milik tenant
5. Cek dashboard tenant untuk notifikasi

## Status
🔧 Perbaikan selesai - perlu testing frontend