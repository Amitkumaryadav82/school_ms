#!/bin/bash

echo "==== School Management System Development Environment ===="
echo "Starting development environment..."

# Change to the project directory
cd "$(dirname "$0")"

# Function to start the backend
start_backend() {
  echo "Starting backend server..."
  cd ./backend/school-app
  # Run in background
  ./mvnw spring-boot:run &
  BACKEND_PID=$!
  echo "Backend started with PID: $BACKEND_PID"
  cd ../..
}

# Function to start the frontend
start_frontend() {
  echo "Starting frontend development server..."
  cd ./frontend
  # Run in background
  npm run dev &
  FRONTEND_PID=$!
  echo "Frontend started with PID: $FRONTEND_PID"
  cd ..
}

# Start both services
start_backend
start_frontend

echo "✅ Development environment started!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Handle shutdown gracefully
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Keep script running
wait
