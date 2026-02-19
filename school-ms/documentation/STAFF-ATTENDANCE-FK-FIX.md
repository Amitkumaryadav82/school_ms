# Staff Attendance Foreign Key Constraint Fix

## Issue

When trying to mark a staff's attendance, the application was reporting a 409 Conflict error. The underlying database error was:

```
ERROR: insert or update on table "staff_attendance" violates foreign key constraint "staff_attendance_staff_id_fkey"
Detail: Key (staff_id)=(9) is not present in table "staff".
```

## Root Cause

The `StaffAttendance` entity was referencing the `staff` table in its foreign key constraint, but the current staff data is stored in the `school_staff` table. This mismatch was causing foreign key constraint violations when trying to save attendance records.

## Solution

1. **Updated the `StaffAttendance` entity:**
   - Modified the `@JoinColumn` annotation to explicitly reference the `id` column in the `school_staff` table.
   - Added better error handling to diagnose these issues more easily in the future.

2. **Created a database migration script:**
   - Added a SQL migration script (`V20250627__update_staff_attendance_table.sql`) to fix the foreign key constraint.
   - The script drops the old constraint and creates a new one pointing to the `school_staff` table.
   - Also creates the `staff_attendance` table if it doesn't exist and adds appropriate indexes.

3. **Enhanced error handling in `EmployeeAttendanceServiceImpl`:**
   - Added detailed logging to track the flow of attendance marking.
   - Improved error messages to be more specific about the nature of failures.
   - Added specific handling for foreign key violations and unique constraint violations.

## How to Apply the Fix

Run the provided batch file `fix-attendance-db.bat` which will:
1. Stop the current server if running
2. Build the backend with the updated code
3. Restart the backend, which will apply the database migration scripts

## Verifying the Fix

After applying the fix, try marking attendance again for a staff member. If the issue persists:

1. Verify that the staff ID you're using exists in the `school_staff` table with:
   ```sql
   SELECT * FROM school_staff WHERE id = <staff_id>;
   ```

2. Check if there's already an attendance record for the staff on the given date:
   ```sql
   SELECT * FROM staff_attendance WHERE staff_id = <staff_id> AND attendance_date = '<date>';
   ```

3. Confirm that the database migration ran successfully by checking the `flyway_schema_history` table:
   ```sql
   SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;
   ```
