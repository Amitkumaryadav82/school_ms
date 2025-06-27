@echo off
echo Building and restarting after Staff Attendance fixes
echo ==================================================

cd %~dp0
cd frontend

echo Building frontend...
call npm run build

echo Starting the applications...
cd ..
start cmd /k "cd frontend && npm run dev"
start cmd /k "cd backend\school-app && java -jar target\school-app.jar"

echo Applications started successfully!
echo Check the frontend at http://localhost:5173
echo Check the backend at http://localhost:8080
