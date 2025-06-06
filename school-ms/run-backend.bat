@echo off
echo ==== School Management System Backend Run ====
cd %~dp0\backend\school-app
echo Starting Spring Boot application...
call mvn spring-boot:run
echo.
if %ERRORLEVEL% == 0 (
    echo Application stopped successfully.
) else (
    echo Application exited with errors. Check the logs above.
)
pause
