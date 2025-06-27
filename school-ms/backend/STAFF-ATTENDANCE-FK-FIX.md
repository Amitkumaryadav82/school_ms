# Staff Attendance Foreign Key Reference Fix

## Issue

The application was encountering a `409 Conflict` error with the following details:

```
ERROR: insert or update on table "staff_attendance" violates foreign key constraint "staff_attendance_staff_id_fkey"
Detail: Key (staff_id)=(9) is not present in table "staff".
```

This error occurred when attempting to mark staff attendance. The root cause was a mismatch between database tables:

1. The `StaffAttendance` entity was trying to store records in the `staff_attendance` table
2. The `staff_attendance` table had a foreign key constraint referencing a `staff` table
3. However, the application had been migrated to use a new `school_staff` table for staff records
4. The foreign key constraint was never updated to point to the new table

## Solution

We've implemented a comprehensive fix that:

1. Updates the foreign key constraint in the `staff_attendance` table to reference the `school_staff` table
2. Adds validation triggers to ensure data consistency
3. Optimizes the table with proper indexes
4. Improves error handling in the application code

## Implementation Details

### Database Changes

The following changes were made to the database:

1. Dropped the incorrect foreign key constraint to the old `staff` table
2. Added a new foreign key constraint pointing to the `school_staff` table
3. Added a validation trigger to prevent invalid staff IDs
4. Created indexes for performance optimization
5. Added an automatic timestamp update trigger

### Application Changes

The application code has been updated to:

1. Better handle foreign key constraint violations
2. Provide more specific error messages
3. Improve logging to diagnose issues

## How to Apply the Fix

1. Run the SQL script using the provided batch file:
   - Windows: `run_staff_attendance_fix.bat`
   - Linux/Mac: `bash run_staff_attendance_fix.sh`

2. Enter your database password when prompted

3. Restart the Spring Boot application:
   - Windows: `run-backend.bat`
   - Linux/Mac: `bash run-backend.sh`

## Testing the Fix

After applying the fix, you should be able to:

1. Mark attendance for existing staff members
2. Update attendance status without encountering errors
3. View and report on attendance records

If you encounter any issues, please check the application logs for detailed error messages.

## Additional Notes

- The fix ensures that only valid staff IDs (those present in the `school_staff` table) can be referenced in the attendance records
- The unique constraint on (staff_id, attendance_date) prevents duplicate attendance records
- The error messages have been improved to provide more actionable information
