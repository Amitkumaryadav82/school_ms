# Dummy Data Seed Script

## Overview

This script (`dummy_data_seed.sql`) creates comprehensive test data for all functionalities in the School Management System.

## What's Included

The script creates realistic dummy data for:

### 1. **Staff Data** (10 staff members)
- 5 Teachers (Mathematics, English, Science, History, PE)
- 1 Librarian
- 1 Principal
- 2 Administrative Staff
- 1 Account Officer

### 2. **Student Data** (18 students)
- Students across all grades (1-12)
- Complete profile information
- Parent/guardian details
- Contact information

### 3. **Admissions** (4 applications)
- Pending applications
- Approved applications
- Rejected applications

### 4. **Attendance Records**
- **Staff Attendance**: Last 30 days for all staff
  - Includes present, absent, half-day, and holiday records
  - Check-in/check-out times
- **Student Attendance**: Last 30 days for all students
  - Includes present, absent, late, and holiday records

### 5. **School Holidays** (10 holidays)
- National holidays
- School breaks (Spring, Winter)
- Recurring and one-time holidays

### 6. **Fee Structures** (17 fee types)
- Tuition fees for all grades
- Library, Sports, Lab fees
- Exam and Activity fees
- Transport fees

### 7. **Fee Assignments & Payments**
- Fees assigned to first 10 students
- Sample payment records (partial and full payments)
- Different payment methods (Cash, Online)

### 8. **Transport Routes** (5 routes)
- North, South, East, West, Central routes
- Route numbers and fee amounts

### 9. **Library Data**
- **8 Books** across different categories
  - Fiction, Science, Mathematics, History, etc.
- **8 Library Transactions**
  - Currently issued books
  - Returned books
  - Overdue books with fines

### 10. **Examination Data**
- **8 Exams** (Mid-term, Final, Unit tests)
- **15 Subjects** across different grades
- **Exam-Subject mappings**
- **Sample student marks**

### 11. **Timetable Data**
- **9 Time slots** (including breaks)
- Sample timetable entries for Grade 1 Section A

## Prerequisites

1. Database must be created and initialized with `consolidated_school_database.sql`
2. PostgreSQL must be running
3. Database connection details:
   - Host: localhost
   - Port: 5435
   - Database: school_db
   - Username: postgres
   - Password: admin

## How to Run

### Option 1: Using psql command line

```powershell
# From the school-ms directory
psql -U postgres -d school_db -p 5435 -f dummy_data_seed.sql
```

When prompted, enter password: `admin`

### Option 2: Using pgAdmin

1. Open pgAdmin
2. Connect to your database (school_db)
3. Open Query Tool
4. Load the `dummy_data_seed.sql` file
5. Execute the script

### Option 3: Using DBeaver or other GUI tools

1. Connect to school_db
2. Open SQL Editor
3. Load and execute `dummy_data_seed.sql`

## Verification

After running the script, you should see a summary output like:

```
========================================
DUMMY DATA INSERTION SUMMARY
========================================
Staff Members: 10
Students: 18
Admissions: 4
Staff Attendance Records: 300
Student Attendance Records: 540
School Holidays: 10
Fee Structures: 17
Transport Routes: 5
Library Books: 8
Library Transactions: 8
Exams: 8
Subjects: 15
Timetable Entries: 2
========================================
Dummy data insertion completed!
========================================
```

## Testing the Application

After loading the dummy data, you can test all functionalities:

1. **Dashboard** - View statistics and summaries
2. **Admissions** - See pending/approved applications
3. **Students** - Browse student list with complete profiles
4. **Staff** - View staff members with departments
5. **Staff Attendance** - Check attendance records for last 30 days
6. **Student Attendance** - View student attendance patterns
7. **Timetable** - See sample timetable entries
8. **Examinations** - View exams, subjects, and marks
9. **Library** - Browse books and transactions
10. **Fee Management** - Check fee structures, assignments, and payments

## Important Notes

1. **Transaction Safety**: The script uses BEGIN/COMMIT to ensure all data is inserted atomically
2. **Idempotent**: Safe to run multiple times (uses INSERT with conflict handling where applicable)
3. **Realistic Data**: All data is realistic and follows proper constraints
4. **Relationships**: All foreign key relationships are properly maintained
5. **Date Ranges**: Attendance data covers the last 30 days from current date

## Customization

To add more data, you can:

1. Increase the number of students by adding more INSERT statements
2. Extend attendance records by changing the `generate_series(0, 29)` range
3. Add more subjects, exams, or library books as needed
4. Modify fee amounts or add new fee types

## Troubleshooting

### Error: "relation does not exist"
- Ensure `consolidated_school_database.sql` was run first
- Check that you're connected to the correct database

### Error: "duplicate key value violates unique constraint"
- The script may have been run before
- Either clear the data or modify the script to handle existing data

### Error: "foreign key constraint violation"
- Ensure all prerequisite tables have data
- Check that grade_levels, sections, and class_sections are populated

## Clean Up (Optional)

To remove all dummy data and start fresh:

```sql
-- WARNING: This will delete ALL data except schema
TRUNCATE TABLE 
    staff_attendance, student_attendance, library_transactions,
    student_marks, exam_subjects, timetable, fee_payments,
    student_fee_assignments, admissions, students, school_staff,
    library_books, transport_routes, fee_structures, exams, subjects,
    school_holidays
CASCADE;
```

## Support

If you encounter any issues:
1. Check the PostgreSQL logs
2. Verify database connection settings
3. Ensure all tables exist in the schema
4. Check for any constraint violations in the error messages
