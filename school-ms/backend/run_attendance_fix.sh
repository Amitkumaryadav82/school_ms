#!/bin/bash
echo "Running staff attendance fix SQL script..."

# Get PostgreSQL connection details from environment variables or use defaults
PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
PGDATABASE=${PGDATABASE:-school_db}
PGUSER=${PGUSER:-postgres}

# Ask for password securely
read -s -p "Enter PostgreSQL password: " PGPASSWORD
echo ""
export PGPASSWORD

# Run the SQL script
psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -f staff_attendance_fix.sql

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo "Fix applied successfully!"
    echo ""
    echo "Now restarting the backend application..."
    cd ../school-app
    ./run-app.sh
else
    echo "Error applying database fix. Please check the PostgreSQL connection details and try again."
fi

# Clear the password from environment variables for security
unset PGPASSWORD

echo "Done!"
