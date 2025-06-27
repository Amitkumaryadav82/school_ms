#!/bin/bash
# Script to build and restart the application after API fix

echo "Building and restarting after Attendance API fixes"
echo "=================================================="

# Navigate to project root
cd "$(dirname "$0")/.."

# Build and run backend
echo "Building backend..."
cd backend/school-app
./build.sh
echo "Running backend..."
./run-app.bat &

# Wait for backend to start
echo "Waiting for backend to start (10 seconds)..."
sleep 10

# Build and run frontend
echo "Building frontend..."
cd ../../frontend
npm run build

echo "Starting frontend server..."
npm run dev

echo "Application started successfully!"
echo "Check the frontend at http://localhost:5173"
echo "Check the backend at http://localhost:8080"
