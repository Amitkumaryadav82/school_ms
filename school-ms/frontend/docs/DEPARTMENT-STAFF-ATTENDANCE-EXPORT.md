# Department Staff Attendance Export

This feature allows administrators to export staff attendance data for specific departments as CSV files. The export functionality is part of the staff attendance management module.

## Feature Overview

- Administrators can select a department from a dropdown menu in the "Department Reports" tab
- The system will generate a CSV file containing attendance records for all staff in the selected department
- The CSV includes daily attendance status for each day of the selected month and year
- Summary statistics (present days, absent days, etc.) are also included in the export

## How to Use

1. Navigate to the "Attendance Reports & Analytics" page
2. Switch to the "Department Reports" tab
3. Select the desired year, month, and department from the dropdown menus
4. Click the "Export Department Report" button at the top of the page
5. The CSV file will be automatically downloaded to your computer

## CSV Format

The exported CSV file contains the following columns:

1. Staff ID - Unique identifier for each staff member
2. Name - Full name of the staff member
3. Department - Department the staff member belongs to
4. Daily status columns (one for each day of the month) - Shows attendance status:
   - "P" for Present
   - "A" for Absent
   - "H" for Half Day
   - "L" for Leave
   - "-" for No data
5. Present - Total number of present days for the month
6. Absent - Total number of absent days for the month
7. Half Day - Total number of half days for the month
8. Leave - Total number of leave days for the month
9. Attendance % - Overall attendance percentage for the month

## Technical Implementation

- The feature is implemented entirely on the client-side using existing backend APIs
- No backend code changes were required
- Attendance data is fetched once and processed locally before generating the CSV
- The CSV is generated dynamically based on the selected filters
- The feature gracefully handles edge cases like no data and empty departments

## File Naming Convention

The downloaded CSV file follows this naming convention:
`DepartmentName_attendance_month_year.csv`

For example: `Science_attendance_jul_2025.csv` or `All_Departments_attendance_jul_2025.csv`
