#!/bin/bash

# Frontend Development Server Startup Script
echo "🎨 Starting Frontend Development Server for School Management System..."

# Navigate to frontend directory
cd /workspaces/school_ms/school-ms/frontend

# Check if Node.js is available
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm is not available. Please install npm first."
    exit 1
fi

echo "📋 Node.js version:"
node --version
echo "📋 npm version:"
npm --version

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies. Please check your network connection."
        exit 1
    fi
fi

# Start the development server
echo ""
echo "⏰ Starting Vite development server..."
echo "🔗 Frontend will be available at: http://localhost:5173"
echo "🔗 Backend API proxy: http://localhost:5173/api -> http://localhost:8080/api"
echo ""
echo "💡 Make sure the backend is running on port 8080 before making API calls."
echo ""

npm run dev
