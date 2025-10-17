#!/bin/bash

echo "🚀 Starting E-commerce Application with Database Setup"
echo "=================================================="

# Navigate to backend directory
cd backend

echo "📦 Installing backend dependencies..."
npm install

echo "🗄️  Setting up database..."
npm run setup-db

echo "🔍 Testing database connection..."
npm run test-db

echo "🌐 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Navigate back to root and start frontend
cd ..

echo "📦 Installing frontend dependencies..."
npm install

echo "🎨 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Application started successfully!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5003 (or next available port)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait