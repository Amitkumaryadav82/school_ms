@echo off
echo ===================================================
echo Staff Attendance Database Fix and Backend Restart
echo ===================================================
echo.

echo 1. Stopping current server if running...
taskkill /f /im java.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo 2. Building the backend...
cd "%~dp0\..\school-ms\backend\school-app"
call mvn clean package -DskipTests

echo.
echo 3. Running the backend...
cd "%~dp0\..\school-ms\backend\school-app"
start java -jar target\school-app-1.0.0.jar

echo.
echo ===================================================
echo Backend restarted! 
echo.
echo If you continue to experience issues:
echo 1. Check the database schema to ensure 'school_staff' table exists
echo 2. Verify that staff IDs you're using actually exist in the database
echo 3. Check backend_logs.txt for detailed error messages
echo ===================================================
