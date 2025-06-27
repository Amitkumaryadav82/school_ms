@echo off
echo ======================================================================
echo Fixing Staff Attendance Foreign Key Reference
echo ======================================================================
echo This script will update the staff_attendance table to correctly reference the school_staff table.

REM Set your database connection details here
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=school_db
set PGUSER=postgres

echo.
echo Database connection details:
echo Host: %PGHOST%
echo Port: %PGPORT%
echo Database: %PGDATABASE%
echo User: %PGUSER%
echo.

echo Please enter your PostgreSQL password:
set /p PGPASSWORD=

echo.
echo Applying SQL fixes...

REM Execute the SQL script
psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -f fix_staff_attendance_reference.sql

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to execute the SQL script.
    echo Please check your database connection details and password.
) else (
    echo.
    echo ✅ Staff attendance table has been updated successfully!
    echo.
    echo You may now restart the Spring Boot application to apply these changes.
    echo.
)

echo Press any key to exit...
pause > nul
