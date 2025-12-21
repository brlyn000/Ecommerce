# 🚀 E-Commerce Backend API

Node.js + Express backend for the e-commerce platform with MySQL database.

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **CORS** - Cross-origin requests

## 📁 Structure

```
backend/
├── src/
│   ├── controllers/    # Route handlers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── config/        # Configuration
├── public/uploads/    # File uploads
└── database.sql       # Database schema
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Setup database
mysql -u root -p < database.sql
npm run setup-db

# Start development server
npm run dev
```

## 🔧 Environment Variables

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=e-commerce
JWT_SECRET=your_jwt_secret
PORT=5006
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (tenant)
- `PUT /api/products/:id` - Update product (tenant)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `PUT /api/orders/:id` - Update order status

## 🗄️ Database

MySQL database with the following tables:
- users (multi-role: admin/tenant/user)
- products (with categories and ratings)
- orders (with order items)
- comments (reviews and ratings)
- notifications (real-time alerts)

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- Input validation
- SQL injection prevention