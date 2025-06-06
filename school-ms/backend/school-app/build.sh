#!/bin/bash

echo "==== School Management System Backend Build Script ===="
echo "Building backend application..."

# Change to the backend directory
cd "$(dirname "$0")"

# Clean and package with Maven, skipping tests for faster builds during development
./mvnw clean package -DskipTests

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  echo "To run the application, execute: ./mvnw spring-boot:run"
else
  echo "❌ Build failed! Check the errors above."
fi
