#!/bin/bash

echo "Restarting backend with database-backed attendance implementation..."

cd "$(dirname "$0")/backend/school-app"
mvn clean package -DskipTests

echo "Starting application..."
cd "$(dirname "$0")/backend/school-app"
java -jar target/school-app-0.0.1-SNAPSHOT.jar &
SERVER_PID=$!

echo "Waiting for application to start..."
sleep 10

echo
echo "============================================================="
echo "Server restarted with database-backed attendance implementation"
echo "============================================================="
echo
echo "Test the following endpoints:"
echo "- GET /api/staff/attendance?date=2025-06-27"
echo "- POST /api/staff/attendance"
echo "- PUT /api/staff/attendance/{id}"
echo "- GET /api/staff/attendance?employeeId={id}"
echo
echo "Verify that data persists after application restart."
echo "============================================================="

# Wait for user to press a key, then kill the server
read -p "Press any key to stop the server..." -n1 -s
kill $SERVER_PID
echo "Server stopped."
