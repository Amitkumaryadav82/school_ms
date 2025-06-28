@echo off
echo Running quick fixes for holiday attendance and department display issues...

cd /d "%~dp0"

echo 1. Running SQL script to fix department data and holiday attendance status...
psql -U postgres -d school_management -f fix-holiday-attendance.sql

echo 2. Reprocessing all holidays to ensure attendance is properly marked...
curl -X POST http://localhost:8080/api/debug/holiday-attendance/sync-all-holidays

echo 3. Completed! Please check the attendance page to verify the fixes.
echo    If issues persist, please use the debug endpoint at:
echo    POST http://localhost:8080/api/debug/holiday-attendance-test/reprocess-attendance?date=2025-07-06

echo Done!
