@echo off
echo Replacing corrupted EmployeeAttendanceServiceImpl.java with fixed version...
copy /Y "c:\Users\amitk\Documents\school_ms\school-ms\backend\school-app\src\main\java\com\school\attendance\service\impl\EmployeeAttendanceServiceImpl.java.fixed" "c:\Users\amitk\Documents\school_ms\school-ms\backend\school-app\src\main\java\com\school\attendance\service\impl\EmployeeAttendanceServiceImpl.java"
echo File replacement complete. Please rebuild the backend project.
