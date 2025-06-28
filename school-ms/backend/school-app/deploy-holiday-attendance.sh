#!/bin/bash

echo "Building and deploying holiday attendance implementation..."

cd "$(dirname "$0")"

# Compile the project
echo "Compiling project..."
mvn clean compile

# Package the application
echo "Packaging application..."
mvn package -DskipTests

# Create a backup of the current deployment if needed
if [ -f target/school-app.jar.deployed ]; then
    echo "Creating backup of current deployment..."
    cp target/school-app.jar.deployed target/school-app.jar.backup-"$(date +%Y%m%d-%H%M%S)"
fi

# Copy the new JAR to the deployment location
echo "Deploying new JAR..."
cp target/school-app.jar target/school-app.jar.deployed

echo "Deployment complete! To test the holiday attendance functionality, use the following endpoints:"
echo "1. GET  /api/debug/holiday-attendance/is-holiday - Check if a date is a holiday"
echo "2. POST /api/debug/holiday-attendance/ensure-holiday-attendance - Create holiday attendance records for a date"
echo "3. POST /api/debug/holiday-attendance/sync-all-holidays - Sync attendance for all holidays"

echo "Done!"
