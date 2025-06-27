@echo off
echo Running staff attendance fix SQL script...

REM Get PostgreSQL connection details from environment variables or use defaults
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=school_db
set PGUSER=postgres

REM Ask for password securely
set /p PGPASSWORD="Enter PostgreSQL password: "

REM Run the SQL script
psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -f staff_attendance_fix.sql

REM Check if the command was successful
if %ERRORLEVEL% EQU 0 (
    echo Fix applied successfully!
    echo.
    echo Now restarting the backend application...
    cd ..\\school-app
    call run-app.bat
) else (
    echo Error applying database fix. Please check the PostgreSQL connection details and try again.
)

REM Clear the password from environment variables for security
set PGPASSWORD=

echo Done!
pause
