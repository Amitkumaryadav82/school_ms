#!/bin/bash
# Script to remove the com.example.schoolms package after migration is complete

echo "Removing legacy com.example.schoolms package..."

# Main package removal
if [ -d "backend/school-app/src/main/java/com/example/schoolms" ]; then
    echo "Removing com.example.schoolms package files..."
    rm -rf backend/school-app/src/main/java/com/example/schoolms
    
    # Also try to remove parent directories if empty
    if [ -z "$(ls -A backend/school-app/src/main/java/com/example)" ]; then
        echo "Removing empty com.example directory..."
        rmdir backend/school-app/src/main/java/com/example
    fi
    
    echo "Legacy package removed successfully."
else
    echo "com.example.schoolms package not found. It may have been already removed."
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

echo "Package cleanup complete. Please run the application to verify it starts without errors."
