#!/bin/bash
# Script to remove the legacy packages after migration is complete

echo "Removing legacy com.example.schoolms package..."

# Remove com.example.schoolms package
if [ -d "backend/school-app/src/main/java/com/example/schoolms" ]; then
    echo "Removing com.example.schoolms package files..."
    rm -rf backend/school-app/src/main/java/com/example/schoolms
    
    # Also try to remove parent directories if empty
    if [ -z "$(ls -A backend/school-app/src/main/java/com/example)" ]; then
        echo "Removing empty com.example directory..."
        rmdir backend/school-app/src/main/java/com/example
    fi
    
    echo "Legacy com.example.schoolms package removed successfully."
else
    echo "com.example.schoolms package not found. It may have been already removed."
fi

echo "Removing legacy com.school.hrm package..."

# Remove com.school.hrm package
if [ -d "backend/school-app/src/main/java/com/school/hrm" ]; then
    echo "Removing com.school.hrm package files..."
    rm -rf backend/school-app/src/main/java/com/school/hrm
    
    echo "Legacy com.school.hrm package removed successfully."
else
    echo "com.school.hrm package not found. It may have been already removed."
fi

echo "Removing legacy com.school.staff package..."

# Remove com.school.staff package (consolidated staff controller)
if [ -d "backend/school-app/src/main/java/com/school/staff/controller/ConsolidatedStaffController.java" ]; then
    echo "Removing com.school.staff.controller.ConsolidatedStaffController.java..."
    rm -f backend/school-app/src/main/java/com/school/staff/controller/ConsolidatedStaffController.java
    
    echo "Legacy ConsolidatedStaffController removed successfully."
else
    echo "ConsolidatedStaffController not found. It may have been already removed."
fi

# Verify if application still compiles
echo "Verifying that the application still compiles..."
cd backend/school-app
if command -v ./mvnw &> /dev/null; then
    ./mvnw clean compile
elif command -v mvn &> /dev/null; then
    mvn clean compile
else
    echo "WARNING: Could not find Maven. Please compile the application manually."
fi

echo "Checking for remaining references to legacy packages in imports..."
grep -r --include="*.java" "import com.example.schoolms" ./src || echo "No references to com.example.schoolms found."
grep -r --include="*.java" "import com.school.hrm" ./src || echo "No references to com.school.hrm found."

echo "Package cleanup complete. Please run the application to verify it starts without errors."
