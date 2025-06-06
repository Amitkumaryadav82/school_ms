#!/bin/bash

echo "==== School Management System Frontend Build Script ===="
echo "Building frontend application..."

# Change to the frontend directory
cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the frontend application
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  echo "To start the development server, execute: npm run dev"
else
  echo "❌ Build failed! Check the errors above."
fi
