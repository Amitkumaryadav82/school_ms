@echo off
echo ======================================================================
echo Holiday Attendance Debug Implementation
echo ======================================================================

echo 1. Rebuilding the backend application...
cd ..\
call build-backend-all.bat

echo 2. Restarting the application...
call run-backend.bat

echo ======================================================================
echo Debug Implementation complete! 
echo ======================================================================
echo To test:
echo 1. Create a test holiday: http://localhost:8080/api/debug/holidays/create-test-holiday
echo 2. Check if today is a holiday: http://localhost:8080/api/debug/holidays/check-date
echo 3. View attendance for today: http://localhost:8080/api/attendance/date/2025-06-27
echo ======================================================================

pause
