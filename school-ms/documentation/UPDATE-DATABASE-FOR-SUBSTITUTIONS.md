# Quick Database Update Guide for Teacher Substitutions

## Overview
This guide helps you update your database to support the new teacher substitutions feature with test data.

## Prerequisites
- PostgreSQL installed and running
- Database: `school_db`
- Port: `5435`
- Username: `postgres`
- Password: `admin`

## Option 1: Fresh Database Setup (Recommended)

If you want to start fresh with all the latest schema and data:

```powershell
# 1. Clean existing dummy data (optional, if you have old data)
psql -U postgres -d school_db -p 5435 -f school-ms/clean_dummy_data.sql

# 2. Run consolidated schema (creates/updates all tables)
psql -U postgres -d school_db -p 5435 -f school-ms/consolidated_school_database.sql

# 3. Insert all dummy data including teacher/timetable data
psql -U postgres -d school_db -p 5435 -f school-ms/dummy_data_seed_india.sql
```

## Option 2: Add Only Substitutions Table (If you already have data)

If you already have data and just want to add the substitutions feature:

```powershell
# Run the quick fix script
psql -U postgres -d school_db -p 5435 -f school-ms/fix-database-for-substitutions.sql
```

This will:
- Add the `timetable_substitutions` table
- NOT touch your existing data

However, you'll need to manually add teacher details and timetable slots for testing.

## What Gets Created

### New Tables
- `timetable_substitutions` - Stores temporary teacher replacements

### Test Data (from dummy_data_seed_india.sql Part 15)
- 6 teacher_details records (Rajesh Kumar, Priya Sharma, Amit Patel, etc.)
- Teacher-subject mappings (which teachers teach which subjects)
- Teacher-class mappings (which teachers teach which classes)
- Sample timetable slots for Class 10-A and 9-A (Monday schedule)

## Verify Installation

After running the scripts, verify everything is set up:

```sql
-- Check if substitutions table exists
SELECT COUNT(*) FROM timetable_substitutions;

-- Check teacher details
SELECT COUNT(*) FROM teacher_details;

-- Check timetable slots
SELECT 
    c.name as class,
    s.section_name,
    ts.day_of_week,
    ts.period_number,
    sub.name as subject,
    ss.first_name || ' ' || ss.last_name as teacher
FROM timetable_slots ts
JOIN classes c ON ts.class_id = c.id
JOIN sections s ON ts.section_id = s.id
JOIN subjects sub ON ts.subject_id = sub.id
JOIN teacher_details td ON ts.teacher_details_id = td.id
JOIN school_staff ss ON td.staff_id = ss.id
WHERE ts.day_of_week = 'MONDAY'
ORDER BY c.name, ts.period_number;
```

Expected output:
- `timetable_substitutions`: 0 rows (empty, ready for use)
- `teacher_details`: 6 rows
- `timetable_slots`: 10 rows (5 for Class 10-A, 5 for Class 9-A on Monday)

## Testing the Feature

1. **Rebuild and deploy the application**:
   ```powershell
   cd school-ms/frontend
   npm run build
   robocopy dist ..\backend\school-app\src\main\resources\static /E /PURGE
   cd ..\backend\school-app
   mvn package -DskipTests
   java -jar target/school-app-0.0.1-SNAPSHOT.jar
   ```

2. **Login**: http://localhost:8080
   - Username: `admin`
   - Password: `password`

3. **Navigate**: Timetable → Substitutions tab

4. **Test Scenario**:
   - Select date: Any Monday (or today if it's Monday)
   - Select absent teacher: "Rajesh Kumar"
   - You should see 5 classes needing substitutes
   - Click "Assign" on any class
   - System will suggest available teachers sorted by workload
   - Assign a substitute and verify it appears in the table

## Troubleshooting

### Error: "relation timetable_substitutions already exists"
This means the table was already created. You can safely ignore this or drop and recreate:
```sql
DROP TABLE IF EXISTS timetable_substitutions CASCADE;
```
Then re-run the schema script.

### Error: "relation timetable_substitutions does not exist"
Run the fix script:
```powershell
psql -U postgres -d school_db -p 5435 -f school-ms/fix-database-for-substitutions.sql
```

### No teachers appear in dropdown
Make sure you ran `dummy_data_seed_india.sql` which includes Part 15 (teacher details).

### No classes appear when selecting a teacher
The sample data only includes Monday schedules for Class 10-A and 9-A. Make sure:
- You selected "Rajesh Kumar" as the absent teacher
- The date is a Monday (or change the test data to match your selected day)

## Summary

The quickest way to get everything working:

```powershell
# One-liner to set up everything
psql -U postgres -d school_db -p 5435 -f school-ms/clean_dummy_data.sql; psql -U postgres -d school_db -p 5435 -f school-ms/consolidated_school_database.sql; psql -U postgres -d school_db -p 5435 -f school-ms/dummy_data_seed_india.sql
```

Then rebuild and run the application!

---

**Need Help?** Check the detailed documentation in `TEACHER-SUBSTITUTIONS-IMPLEMENTATION.md`
