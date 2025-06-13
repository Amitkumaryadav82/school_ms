#!/bin/bash

echo "==== School Management System Backend Fixes ===="
cd /mnt/c/Users/amitk/Documents/school_ms/school-ms/backend/school-app

echo "1. Fixing the ExamTypeDTO issue"
# This is already fixed

echo "2. Fixing the Exam.java @Override issue"
# This is already fixed

echo "3. Fixing the BulkUploadResponse constructor usage"
# This is already fixed

echo "4. Fixing Message related issues"
# This is already fixed

echo "5. Fixing Holiday related issues"
# This is already fixed

echo "6. Running the build"
mvn clean compile -Dlombok.delombok.verbose=true

if [ $? -eq 0 ]; then
    echo "Build successful!"
else
    echo "Build failed with errors. Check the output above."
fi
