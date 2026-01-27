#!/bin/bash
# Production Deployment Script for School Management System
# This script builds the frontend, copies it to backend, and builds the production JAR

set -e  # Exit on error

echo "========================================"
echo "School Management System"
echo "Production Deployment Script"
echo "========================================"
echo ""

# Check if we're in the correct directory
if [ ! -d "frontend" ]; then
    echo "ERROR: frontend directory not found!"
    echo "Please run this script from the school-ms directory"
    exit 1
fi

if [ ! -d "backend/school-app" ]; then
    echo "ERROR: backend/school-app directory not found!"
    echo "Please run this script from the school-ms directory"
    exit 1
fi

echo "Step 1: Building Frontend..."
echo "========================================"
cd frontend
npm install
npm run build
echo "Frontend build completed successfully!"
echo ""

echo "Step 2: Copying Frontend to Backend..."
echo "========================================"
cd ..
rm -rf backend/school-app/src/main/resources/static
mkdir -p backend/school-app/src/main/resources/static
cp -r frontend/dist/* backend/school-app/src/main/resources/static/
echo "Frontend copied to backend successfully!"
echo ""

echo "Step 3: Building Backend JAR..."
echo "========================================"
cd backend/school-app
mvn clean package -DskipTests
echo "Backend JAR built successfully!"
echo ""

echo "========================================"
echo "DEPLOYMENT BUILD COMPLETED!"
echo "========================================"
echo ""
echo "JAR Location: backend/school-app/target/school-app-1.0.0.jar"
echo ""
echo "To run the application:"
echo "  java -jar backend/school-app/target/school-app-1.0.0.jar"
echo ""
echo "Default Login:"
echo "  Username: admin"
echo "  Password: password"
echo ""
echo "IMPORTANT: Change the admin password after first login!"
echo ""
echo "For production deployment instructions, see:"
echo "  PRODUCTION-DEPLOYMENT-GUIDE.md"
echo ""
