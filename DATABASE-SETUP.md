# Database Setup Guide

## Prerequisites
- MySQL Server installed and running
- Node.js and npm installed

## Quick Setup

### 1. Automatic Setup (Recommended)
```bash
./start-with-db.sh
```

### 2. Manual Setup

#### Backend Setup
```bash
cd backend
npm install
npm run setup-db
npm run test-db
npm run dev
```

#### Frontend Setup
```bash
npm install
npm run dev
```

## Database Configuration

### Environment Variables (.env)
```
PORT=5002
DB_HOST=localhost
DB_USER=brillian
DB_PASSWORD=passwordku
DB_NAME=e-commerce
```

### Database Schema

#### Categories Table
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(100), NOT NULL)
- description (TEXT)
- icon (VARCHAR(50))
- link (VARCHAR(100))
- created_at (TIMESTAMP)

#### Products Table
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(200), NOT NULL)
- description (TEXT)
- long_description (TEXT)
- price (DECIMAL(10,2), NOT NULL)
- image (VARCHAR(255))
- rating (INT, DEFAULT 0)
- stock_status (ENUM: 'available', 'limited', 'sold-out')
- category_id (INT, FOREIGN KEY)
- discount (VARCHAR(10))
- whatsapp (VARCHAR(255))
- created_at (TIMESTAMP)

## API Endpoints

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get product by ID
- GET `/api/products/category/:categoryId` - Get products by category
- POST `/api/products` - Create new product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Categories
- GET `/api/categories` - Get all categories
- GET `/api/categories/:id` - Get category by ID
- POST `/api/categories` - Create new category
- PUT `/api/categories/:id` - Update category
- DELETE `/api/categories/:id` - Delete category

## Troubleshooting

### Database Connection Issues
1. Ensure MySQL server is running
2. Check credentials in .env file
3. Run `npm run test-db` to verify connection

### Port Conflicts
- Backend runs on port 5002
- Frontend runs on port 5173
- Change ports in configuration if needed

### Sample Data
The setup script automatically creates sample categories and products for testing.