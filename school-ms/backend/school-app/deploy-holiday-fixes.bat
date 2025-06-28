@echo off
echo Deploying holiday attendance fixes...

cd /d "%~dp0"

rem Compile the project
echo Compiling project with fixes...
call mvn clean compile

rem Package the application
echo Packaging application...
call mvn package -DskipTests

rem Create a backup of the current deployment if needed
if exist target\school-app.jar.deployed (
    echo Creating backup of current deployment...
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
        set mydate=%%c%%a%%b
    )
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
        set mytime=%%a%%b
    )
    copy target\school-app.jar.deployed target\school-app.jar.backup-%mydate%-%mytime%
)

rem Copy the new JAR to the deployment location
echo Deploying new JAR...
copy target\school-app.jar target\school-app.jar.deployed

echo.
echo Deployment complete! Here are the test endpoints to verify the fixes:
echo.
echo 1. Test holiday attendance marking for today:
echo    POST /api/debug/holiday-attendance-test/create-today-holiday-and-mark-attendance
echo.
echo 2. Reprocess attendance for a specific date:
echo    POST /api/debug/holiday-attendance-test/reprocess-attendance?date=2025-07-06
echo.
echo 3. Check if a date is a holiday:
echo    GET /api/debug/holiday-attendance/is-holiday?date=2025-07-06
echo.
echo These endpoints will help ensure that all staff attendance is properly 
echo marked as HOLIDAY and that department information is displayed correctly.
echo.
echo Done!
