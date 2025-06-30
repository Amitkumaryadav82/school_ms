# Weekly Attendance Bulk Upload Feature

## Overview

This document details the implementation of the weekly attendance upload feature in the Staff Attendance Management system. The enhancement allows administrators to upload attendance data for an entire week at once, rather than just one day at a time.

## Implementation Details

### Key Features Added

1. **Toggle Between Single and Weekly Uploads**
   - Users can switch between single-day and weekly upload modes
   - UI adapts based on the selected mode

2. **Date Range Selection for Weekly Mode**
   - Added date pickers for selecting week start and end dates
   - Shows the date range and number of days in the selection

3. **Weekly Template Generation**
   - Creates CSV templates with columns for each day of the week
   - Uses existing staff data to populate employee rows

4. **Client-Side Processing**
   - Parses weekly CSV files
   - Processes each day's data separately using existing backend APIs
   - Shows progress during processing

5. **Enhanced Results View**
   - Shows detailed processing results for each day in the week
   - Highlights successes and failures with visual indicators

### Technical Approach

The implementation follows a frontend-only approach that leverages existing backend APIs:

- Uses `employeeAttendanceService.markBulkAttendance` to submit attendance data for each day
- Uses `staffService.getAll()` to get employee data for template generation
- Processes the weekly CSV file on the client side to extract daily attendance records
- Makes separate API calls for each day in the selected range

### CSV Format for Weekly Uploads

The weekly template has the following structure:

```
EmployeeId,Name,Department,Mon (MM/DD),Tue (MM/DD),Wed (MM/DD),Thu (MM/DD),Fri (MM/DD),Sat (MM/DD),Sun (MM/DD),Remarks
1001,John Doe,Science,P,P,A,P,H,,,On leave Wednesday
1002,Jane Smith,Math,P,P,P,P,P,,,
```

Where the attendance status codes are:
- P: Present
- A: Absent
- H: Half Day
- L: On Leave

### User Experience

1. User selects "Weekly" mode
2. User chooses start and end dates for the week
3. User downloads the weekly template
4. User fills in attendance data for each day
5. User uploads the completed CSV file
6. System processes each day and shows progress
7. Results display shows success/failure for each day

## Benefits

1. **Efficiency**: Administrators can upload attendance for an entire week in one operation
2. **Consistency**: Using the same attendance codes and validation as the daily upload
3. **Flexibility**: The same weekly view APIs are used, ensuring data consistency
4. **Error Handling**: Detailed error reporting for each day in the upload

## Future Enhancements

The following enhancements could be considered in the future:

1. Backend API for direct weekly uploads (would require backend changes)
2. Bulk editing of uploaded data
3. Partial re-upload of failed days
4. More robust template parsing with additional validation

## Related Files

- `AttendanceUpload.tsx` - Modified to support weekly uploads
- `employeeAttendanceService.ts` - Uses existing APIs
- `staffService.ts` - Used for employee data
