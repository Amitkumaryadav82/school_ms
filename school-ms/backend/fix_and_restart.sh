#!/bin/bash

echo "======================================================================"
echo "Staff Attendance Fix and Application Restart"
echo "======================================================================"

echo "1. Running database fixes..."
bash run_staff_attendance_fix.sh

echo "2. Rebuilding and restarting the backend..."
cd ../
bash build-backend-all.sh
bash run-backend.sh

echo "======================================================================"
echo "Fix applied and application restarted!"
echo "You can now try marking staff attendance again."
echo "======================================================================"

read -p "Press Enter to continue..."
