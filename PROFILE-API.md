# Profile API Endpoints

## Base URL
```
http://localhost:5002/api/profile
```

## Endpoints

### 1. CREATE Profile
**POST** `/api/profile`

Membuat profil user baru.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "081234567890",
  "address": "Jl. Contoh No. 123"
}
```

**Response:**
```json
{
  "message": "Profile created successfully",
  "userId": 1
}
```

### 2. READ Profile (Current User)
**GET** `/api/profile`

Mendapatkan profil user yang sedang login.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "phone": "081234567890",
  "address": "Jl. Contoh No. 123",
  "role": "user",
  "status": "active",
  "payment_methods": null,
  "contact_info": null,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### 3. READ Profile by ID
**GET** `/api/profile/:id`

Mendapatkan profil user berdasarkan ID (admin atau user sendiri).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Same as above

### 4. UPDATE Profile
**PUT** `/api/profile`

Mengupdate profil user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "full_name": "John Doe Updated",
  "phone": "081234567891",
  "address": "Jl. Baru No. 456",
  "email": "john.new@example.com"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

### 5. UPDATE Password
**PUT** `/api/profile/password`

Mengubah password user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

### 6. DELETE Profile (Soft Delete)
**DELETE** `/api/profile`

Menonaktifkan profil user (soft delete).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Profile deactivated successfully"
}
```

### 7. DELETE Profile Permanent (Admin Only)
**DELETE** `/api/profile/:id/permanent`

Menghapus profil user secara permanen (hanya admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Profile permanently deleted"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Username or email already exists"
}
```

### 401 Unauthorized
```json
{
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message"
}
```