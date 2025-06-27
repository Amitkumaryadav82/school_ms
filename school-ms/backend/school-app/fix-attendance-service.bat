@echo off
echo Fixing EmployeeAttendanceServiceImpl.java...
copy /Y "src\main\java\com\school\attendance\service\impl\EmployeeAttendanceServiceImpl.java.fixed" "src\main\java\com\school\attendance\service\impl\EmployeeAttendanceServiceImpl.java"
echo Fixed! The service implementation has been restored from the backup.
pause
