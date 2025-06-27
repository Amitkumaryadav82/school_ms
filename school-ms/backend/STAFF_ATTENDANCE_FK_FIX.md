# Staff Attendance Foreign Key Issue Fix

## Problem

When attempting to mark staff attendance, the system was generating 409 Conflict errors with the following database error:

```
ERROR: insert or update on table "staff_attendance" violates foreign key constraint "staff_attendance_staff_id_fkey"
Detail: Key (staff_id)=(9) is not present in table "staff".
```

## Root Cause

The issue was a database foreign key constraint mismatch. The `staff_attendance` table had a foreign key constraint `staff_attendance_staff_id_fkey` that was pointing to a table named `staff`, but the actual staff data is stored in a table named `school_staff`.

This mismatch occurred because the `Staff` entity in the Java code is mapped to the `school_staff` table:

```java
@Entity(name = "CoreStaff")
@Table(name = "school_staff")
public class Staff {
    // ...
}
```

While the `StaffAttendance` entity correctly references the `Staff` entity:

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "staff_id", nullable = false, referencedColumnName = "id")
private Staff staff;
```

However, at the database level, the foreign key was still configured to reference the old `staff` table.

## Solution

### 1. SQL Fix

We created a SQL migration script (`staff_attendance_fix.sql`) that:

1. Drops the existing incorrect foreign key constraint
2. Adds a new foreign key constraint pointing to the correct table (`school_staff`)
3. Creates a database trigger to validate staff IDs during inserts/updates

### 2. Entity Fix

The `StaffAttendance.java` entity was updated to explicitly reference the correct column in the `Staff` entity:

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "staff_id", nullable = false, referencedColumnName = "id")
private Staff staff;
```

### 3. Running the Fix

To apply this fix:

1. Run the provided batch file:
   - Windows: `run_attendance_fix.bat`
   - Linux/Mac: `bash run_attendance_fix.sh`
   
2. The script will:
   - Apply the database schema changes
   - Restart the backend application

## Verification

After applying the fix:

1. Try marking staff attendance again
2. The 409 Conflict errors should no longer occur
3. Attendance status changes should be persisted correctly

## Additional Notes

- This fix maintains existing data integrity by updating the foreign key constraint without losing any data
- A database trigger was added to provide clearer error messages in case of invalid staff IDs
- The fix is backward compatible with any existing code that references the `StaffAttendance` entity

If you encounter any issues after applying this fix, please check the backend logs for detailed error messages.
