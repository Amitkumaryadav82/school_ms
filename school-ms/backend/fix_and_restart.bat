@echo off
echo ======================================================================
echo Staff Attendance Fix and Application Restart
echo ======================================================================

echo 1. Running database fixes...
call run_staff_attendance_fix.bat

echo 2. Rebuilding and restarting the backend with enhanced eager loading fixes...
echo    - Updated StaffAttendanceRepository with JOIN FETCH queries for both Staff and StaffRole
echo    - Added findByIdWithStaff method for eager loading
echo    - Improved null handling for staff roles
echo    - Added robust error handling in filterByEmployeeType method
cd ..\
call build-backend-all.bat
call run-backend.bat

echo ======================================================================
echo Fix applied and application restarted!
echo You can now try marking staff attendance again.
echo ======================================================================

pause
