@echo off
echo Restarting backend with database-backed attendance implementation...

cd %~dp0backend\school-app
call mvn clean package

echo Starting application...
cd %~dp0backend\school-app
start javaw -jar target\school-app-0.0.1-SNAPSHOT.jar

echo Waiting for application to start...
timeout /t 10 /nobreak

echo.
echo =============================================================
echo Server restarted with database-backed attendance implementation
echo =============================================================
echo.
echo Test the following endpoints:
echo - GET /api/staff/attendance?date=2025-06-27
echo - POST /api/staff/attendance
echo - PUT /api/staff/attendance/{id}
echo - GET /api/staff/attendance?employeeId={id}
echo.
echo Verify that data persists after application restart.
echo =============================================================
