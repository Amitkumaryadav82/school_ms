@echo off
echo ==== School Management System Backend Build ====
cd %~dp0\backend\school-app
echo Building project with Maven...
call mvn clean compile -DskipTests
echo.
if %ERRORLEVEL% == 0 (
    echo Build successful!
) else (
    echo Build failed with errors. Check the output above.
)
pause
