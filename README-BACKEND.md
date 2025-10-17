# Backend Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Installation Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Setup MySQL Database
1. Create MySQL database:
```sql
mysql -u root -p
CREATE DATABASE ecommerce_db;
```

2. Import database schema:
```bash
mysql -u root -p ecommerce_db < database.sql
```

### 3. Configure Environment
Update `backend/.env` with your MySQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
```

### 4. Start Backend Server
```bash
npm run dev
```

### 5. Start Frontend (in separate terminal)
```bash
cd ..
npm run dev
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:categoryId` - Get products by category

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID

## Testing
Visit `http://localhost:5000/api/health` to check if backend is running.

## Database Structure
- `categories` - Product categories
- `products` - Product information with foreign key to categories