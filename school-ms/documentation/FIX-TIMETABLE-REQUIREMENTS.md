# Fix: Empty Class Dropdown in Timetable Requirements

## Problem
The "Class" dropdown in Timetable → Requirements is empty because the `classes` and `subjects` tables don't have any data.

## Root Cause
The `consolidated_school_database.sql` script was missing seed data for:
- `classes` table (Class 1-12)
- `subjects` table (Mathematics, English, Science, etc.)

## Solution

### Option 1: Quick Fix (Recommended if database is already set up)

Run the quick fix script to add only the missing data:

```powershell
psql -U postgres -d school_db -p 5435 -f school-ms/add-classes-and-subjects.sql
```

This will add:
- 12 classes (Class 1 through Class 12)
- 15 subjects (Mathematics, English, Science, Hindi, Physics, Chemistry, Biology, Computer Science, Physical Education, History, Geography, Economics, Accountancy, Business Studies, Social Studies)

### Option 2: Full Database Refresh (If you want to start fresh)

If you want to recreate the entire database with all the latest fixes:

```powershell
# 1. Clean existing data
psql -U postgres -d school_db -p 5435 -f school-ms/clean_dummy_data.sql

# 2. Run updated consolidated schema (now includes classes and subjects)
psql -U postgres -d school_db -p 5435 -f school-ms/consolidated_school_database.sql

# 3. Add test data for teacher substitutions
psql -U postgres -d school_db -p 5435 -f school-ms/dummy_data_seed_india.sql
```

## Verification

After running either option, verify the data was added:

```sql
-- Check classes
SELECT * FROM classes ORDER BY id;

-- Expected output: 12 rows (Class 1 through Class 12)

-- Check subjects
SELECT code, name FROM subjects ORDER BY code;

-- Expected output: 15 rows (MATH01, ENG01, SCI01, etc.)
```

## Testing the Fix

1. **Refresh your browser** (or clear cache)
2. Navigate to: **Timetable → Requirements**
3. Click the **Class dropdown**
4. You should now see: Class 1, Class 2, Class 3, ... Class 12

## What Was Fixed

### Updated Files:
1. **consolidated_school_database.sql**
   - Added Section 5.8: Classes seed data (12 classes)
   - Added Section 5.9: Subjects seed data (15 subjects)
   - Updated verification summary to show class and subject counts

2. **add-classes-and-subjects.sql** (NEW)
   - Quick fix script to add only classes and subjects
   - Safe to run multiple times (uses ON CONFLICT)

## Expected Data

### Classes (12 records):
```
Class 1
Class 2
Class 3
Class 4
Class 5
Class 6
Class 7
Class 8
Class 9
Class 10
Class 11
Class 12
```

### Subjects (15 records):
```
MATH01  - Mathematics
ENG01   - English
SCI01   - Science
SS01    - Social Studies
HIN01   - Hindi
PHY01   - Physics
CHEM01  - Chemistry
BIO01   - Biology
CS01    - Computer Science
PE01    - Physical Education
HIST01  - History
GEO01   - Geography
ECO01   - Economics
ACC01   - Accountancy
BUS01   - Business Studies
```

## Next Steps

After fixing the class dropdown:

1. **Select a Class** (e.g., Class 10)
2. **Select a Section** (e.g., A)
3. **Click "Add Requirement"**
4. **Configure weekly periods** for each subject
5. **Save** the requirements

These requirements will then be used by the auto-generate timetable feature.

## Troubleshooting

### Still seeing empty dropdown?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check browser console for errors (F12)
4. Verify data in database:
   ```sql
   SELECT COUNT(*) FROM classes;  -- Should be 12
   SELECT COUNT(*) FROM subjects; -- Should be 15
   ```

### Backend API not returning data?
1. Check application logs for errors
2. Restart the Spring Boot application:
   ```powershell
   cd school-ms/backend/school-app
   mvn spring-boot:run
   ```

### Database connection issues?
Verify your database credentials in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5435/school_db
spring.datasource.username=postgres
spring.datasource.password=admin
```

## Summary

The issue was simply missing seed data. Running the `add-classes-and-subjects.sql` script will populate the required tables and fix the empty dropdown immediately.

No code changes needed - just database seed data!
