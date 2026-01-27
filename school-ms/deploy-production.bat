@echo off
REM Production Deployment Script for School Management System
REM This script builds the frontend, copies it to backend, and builds the production JAR

echo ========================================
echo School Management System
echo Production Deployment Script
echo ========================================
echo.

REM Check if we're in the correct directory
if not exist "frontend" (
    echo ERROR: frontend directory not found!
    echo Please run this script from the school-ms directory
    pause
    exit /b 1
)

if not exist "backend\school-app" (
    echo ERROR: backend\school-app directory not found!
    echo Please run this script from the school-ms directory
    pause
    exit /b 1
)

echo Step 1: Building Frontend...
echo ========================================
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo Frontend build completed successfully!
echo.

echo Step 2: Copying Frontend to Backend...
echo ========================================
cd ..
if exist "backend\school-app\src\main\resources\static" (
    rmdir /s /q "backend\school-app\src\main\resources\static"
)
mkdir "backend\school-app\src\main\resources\static"
robocopy "frontend\dist" "backend\school-app\src\main\resources\static" /E /NFL /NDL /NJH /NJS
echo Frontend copied to backend successfully!
echo.

echo Step 3: Building Backend JAR...
echo ========================================
cd backend\school-app
call mvn clean package -DskipTests
if errorlevel 1 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)
echo Backend JAR built successfully!
echo.

echo ========================================
echo DEPLOYMENT BUILD COMPLETED!
echo ========================================
echo.
echo JAR Location: backend\school-app\target\school-app-1.0.0.jar
echo.
echo To run the application:
echo   java -jar backend\school-app\target\school-app-1.0.0.jar
echo.
echo Default Login:
echo   Username: admin
echo   Password: password
echo.
echo IMPORTANT: Change the admin password after first login!
echo.
echo For production deployment instructions, see:
echo   PRODUCTION-DEPLOYMENT-GUIDE.md
echo.
pause
