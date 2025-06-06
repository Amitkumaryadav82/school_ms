@echo off
echo ==== School Management System Backend Build - All Steps ====
cd %~dp0\backend\school-app

echo.
echo Step 1: Running Jakarta to Javax import conversion
echo -------------------------------
powershell -ExecutionPolicy Bypass -File .\fix-jakarta-imports.ps1
if %ERRORLEVEL% NEQ 0 (
    echo Failed to run import conversion script!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Step 2: Building project with Maven
echo -------------------------------
echo Building project with Maven...
call mvn clean compile -DskipTests
echo.
if %ERRORLEVEL% == 0 (
    echo Build successful!
    echo.
    echo To run the application, use: run-backend.bat
) else (
    echo Build failed with errors. Check the output above.
)
pause
