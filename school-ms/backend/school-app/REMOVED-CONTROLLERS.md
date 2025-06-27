# Legacy Controllers Removed During Consolidation

The following files were removed during the attendance system consolidation:

1. `TeacherAttendanceController.java`
   - Previously handled teacher attendance only
   - All functionality now available in `EmployeeAttendanceController`

2. `StaffAttendanceController.java`
   - Previously handled non-teaching staff attendance only
   - All functionality now available in `EmployeeAttendanceController`

The consolidated controller now handles both teaching and non-teaching staff through a unified API. 

Note: `AttendanceController.java` was kept as it handles student attendance, which is separate from staff attendance.

For backward compatibility, the consolidated controller implements redirects from the old API paths to the new ones.

See `ATTENDANCE-CONSOLIDATION.md` for more details on the consolidation process.
