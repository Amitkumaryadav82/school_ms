@echo off
echo Restarting application after attendance service fix...

cd %~dp0

REM Stop any running Spring Boot application
taskkill /F /IM java.exe /FI "WINDOWTITLE eq school-app"

REM Rebuild and start
call build-and-run.bat

echo Application restarted!
pause
