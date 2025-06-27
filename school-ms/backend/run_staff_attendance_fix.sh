#!/bin/bash

echo "======================================================================"
echo "Fixing Staff Attendance Foreign Key Reference"
echo "======================================================================"
echo "This script will update the staff_attendance table to correctly reference the school_staff table."

# Set your database connection details here
PGHOST="localhost"
PGPORT="5432"
PGDATABASE="school_db"
PGUSER="postgres"

echo
echo "Database connection details:"
echo "Host: $PGHOST"
echo "Port: $PGPORT"
echo "Database: $PGDATABASE"
echo "User: $PGUSER"
echo

# Ask for password
read -sp "Please enter your PostgreSQL password: " PGPASSWORD
export PGPASSWORD
echo

echo
echo "Applying SQL fixes..."

# Execute the SQL script
psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -f fix_staff_attendance_reference.sql

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to execute the SQL script."
    echo "Please check your database connection details and password."
else
    echo
    echo "✅ Staff attendance table has been updated successfully!"
    echo
    echo "You may now restart the Spring Boot application to apply these changes."
    echo
fi

# Clear password from environment
unset PGPASSWORD

echo "Press Enter to exit..."
read
