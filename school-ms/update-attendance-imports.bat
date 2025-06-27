@echo off
echo Running frontend import migration script...
cd frontend
node scripts/update-imports.js
pause
