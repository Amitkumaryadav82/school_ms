@echo off
echo Building and deploying holiday attendance implementation...

cd /d "%~dp0"

rem Compile the project
echo Compiling project...
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

echo Deployment complete! To test the holiday attendance functionality, use the following endpoints:
echo 1. GET  /api/debug/holiday-attendance/is-holiday - Check if a date is a holiday
echo 2. POST /api/debug/holiday-attendance/ensure-holiday-attendance - Create holiday attendance records for a date
echo 3. POST /api/debug/holiday-attendance/sync-all-holidays - Sync attendance for all holidays

echo Done!
