# 🛒 E-Commerce Platform

<div align="center">
  <p><strong>Modern Multi-Tenant E-Commerce Solution</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
    <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  </p>
</div>

## 📁 Project Structure

```
Ecommerce/
├── frontend/           # React.js Frontend
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # Node.js Backend
│   ├── src/          # API source code
│   ├── public/       # File uploads
│   └── package.json  # Backend dependencies
└── database-diagram.dbml  # Database schema
```

## 🚀 Quick Start

### Frontend Development
```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:5173
```

### Backend Development
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5006
```

### Database Setup
```bash
cd backend
mysql -u root -p < database.sql
npm run setup-db
```

## 📖 Documentation

For detailed documentation, see:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Database Schema](./database-diagram.dbml)

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MySQL
- **Authentication**: JWT with role-based access
- **File Upload**: Multer integration
- **Real-time**: WebSocket notifications

---

**Built with ❤️ using React, Node.js, and MySQL**