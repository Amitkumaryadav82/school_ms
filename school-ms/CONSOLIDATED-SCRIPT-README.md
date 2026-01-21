# Consolidated Database Script - README

## Overview

This document explains how to use the consolidated PostgreSQL database script for the School Management System.

**Script File:** `consolidated_school_database.sql`  
**Created:** January 18, 2026  
**Purpose:** Single-file database deployment for AWS RDS PostgreSQL

---

## What This Script Does

The consolidated script:
- ✅ Creates **45 production tables** in correct dependency order
- ✅ Creates all **indexes** for performance
- ✅ Creates **triggers** for auto-updating timestamps
- ✅ Inserts all **seed data** (~100 records)
- ✅ Keeps **all duplicate columns** for backward compatibility
- ✅ Excludes **legacy tables** (hrm_staff, consolidated_staff, etc.)
- ✅ Provides **verification output** at the end

---

## Prerequisites

### For Local Testing:
- PostgreSQL 14.x, 15.x, or 16.x installed
- `psql` command-line tool available
- Empty database created

### For AWS RDS:
- RDS PostgreSQL instance created
- Security groups configured
- Database endpoint URL available
- Admin credentials ready

---

## Installation Instructions

### Option 1: Local PostgreSQL (Testing)

**Step 1: Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE school_db_test;

# Exit psql
\q
```

**Step 2: Execute Script**
```bash
# Navigate to the script directory
cd school-ms

# Execute the consolidated script
psql -U postgres -d school_db_test -f consolidated_school_database.sql
```

**Step 3: Verify**
```bash
# Connect to the database
psql -U postgres -d school_db_test

# Check table count (should be 45)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

# Check seed data
SELECT COUNT(*) FROM roles;          -- Expected: 6
SELECT COUNT(*) FROM users;          -- Expected: 2
SELECT COUNT(*) FROM grade_levels;   -- Expected: 12
SELECT COUNT(*) FROM sections;       -- Expected: 26
SELECT COUNT(*) FROM class_sections; -- Expected: 48
SELECT COUNT(*) FROM staff_roles;    -- Expected: 6

# Exit
\q
```

### Option 2: AWS RDS PostgreSQL

**Step 1: Connect to RDS**
```bash
# Replace with your RDS endpoint
psql -h your-rds-endpoint.region.rds.amazonaws.com \
     -U school_admin \
     -d school_db \
     -f consolidated_school_database.sql
```

**Step 2: Verify Deployment**
```bash
# Connect to verify
psql -h your-rds-endpoint.region.rds.amazonaws.com \
     -U school_admin \
     -d school_db

# Run verification queries (same as above)
```

---

## Default Admin Credentials

**⚠️ SECURITY WARNING: Change these passwords immediately after first login!**

### Admin User 1
- **Username:** `admin`
- **Password:** `ChangeMe_Initial1!`
- **Email:** admin@schoolms.com
- **Role:** ADMIN

### Admin User 2
- **Username:** `admin1`
- **Password:** `qwerty`
- **Email:** admin1@schoolms.com
- **Role:** ADMIN

---

## What Gets Created

### Tables (45 total)

**Authentication (3):**
- users
- roles
- user_roles

**Staff Management (3):**
- school_staff
- staff_roles
- teacher_details

**Student Management (2):**
- students
- admissions

**Attendance (3):**
- attendance
- staff_attendance
- school_holidays

**Academic Structure (7):**
- grade_levels
- sections
- class_sections
- courses
- chapters
- subjects
- classes

**Timetable (4):**
- timetable_slots
- timetable_settings
- teacher_class_map
- teacher_subject_map

**Exams (8):**
- exams
- exam_classes
- exam_configs
- exam_mark_summaries
- exam_mark_details
- question_paper_format
- blueprint_units
- blueprint_unit_questions

**Fees (10):**
- fees
- fee_structures
- fee_payments
- fee_payment_schedules
- late_fees
- student_fee_assignments
- payment_schedules
- payments
- transport_routes

**Communication (2):**
- messages
- in_app_notifications

**Other (3):**
- school_settings
- employees
- staff_audit_log

### Seed Data

**Roles (6 records):**
- ADMIN, TEACHER, STUDENT, PARENT
- ROLE_ADMIN, ROLE_USER (alternative naming)

**Users (2 records):**
- admin (System Administrator)
- admin1 (Secondary Administrator)

**Grade Levels (12 records):**
- Grades 1 through 12

**Sections (26 records):**
- Sections A through Z

**Class Sections (48 records):**
- Grades 1-12 × Sections A-D for academic year 2025-2026

**Staff Roles (6 records):**
- Teacher, Principal, Admin, Librarian, Management, Account Officer

**Sample Courses (2 records):**
- Mathematics 101
- English Literature

---

## Troubleshooting

### Error: "database does not exist"
**Solution:** Create the database first:
```sql
CREATE DATABASE school_db;
```

### Error: "permission denied"
**Solution:** Ensure you're using a user with CREATE privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE school_db TO school_admin;
```

### Error: "relation already exists"
**Solution:** The database already has tables. Either:
1. Drop the database and recreate it
2. Uncomment the DROP TABLE section in the script (lines 30-60)

### Error: "could not connect to server"
**Solution:** Check:
- PostgreSQL service is running
- Correct host/port
- Security groups allow connection (for RDS)
- Credentials are correct

### Script runs but no output
**Solution:** This is normal. Check the verification section at the end:
```bash
# You should see output like:
# NOTICE:  ========================================
# NOTICE:  DATABASE CREATION SUMMARY
# NOTICE:  ========================================
# NOTICE:  Total Tables Created: 45
# NOTICE:  Roles: 6
# NOTICE:  Users: 2
# ...
```

---

## Application Configuration

After running the script, update your application configuration:

### application-prod.properties
```properties
# Disable Flyway
spring.flyway.enabled=false
spring.jpa.hibernate.ddl-auto=none

# Database Connection
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
```

### Environment Variables
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://your-rds-endpoint:5432/school_db
export SPRING_DATASOURCE_USERNAME=school_admin
export SPRING_DATASOURCE_PASSWORD=your-secure-password
export JWT_SECRET=your-base64-encoded-secret
export JWT_EXPIRATION=86400000
export ALLOWED_ORIGINS=https://your-domain.com
```

---

## Migration Files Backup

The original Flyway migration files have been backed up to:
```
school-ms/backend/school-app/src/main/resources/db/migration_backup/
```

These files are preserved for reference but are no longer used by the application.

---

## Testing Checklist

After deployment, test the following:

### Database Level
- [ ] All 45 tables exist
- [ ] All foreign keys work
- [ ] All unique constraints enforced
- [ ] Seed data inserted correctly
- [ ] Triggers functioning

### Application Level
- [ ] Application starts without errors
- [ ] Login with admin/admin1 works
- [ ] Staff CRUD operations work
- [ ] Student CRUD operations work
- [ ] Attendance marking works
- [ ] Fee management works
- [ ] Exam management works

---

## Rollback Plan

If something goes wrong:

### Local PostgreSQL
```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE school_db_test;
CREATE DATABASE school_db_test;
\q

# Re-run script
psql -U postgres -d school_db_test -f consolidated_school_database.sql
```

### AWS RDS
```bash
# Option 1: Restore from snapshot
# Use AWS Console or CLI to restore from automated backup

# Option 2: Drop and recreate
psql -h your-rds-endpoint -U school_admin -d postgres
DROP DATABASE school_db;
CREATE DATABASE school_db;
\q

# Re-run script
psql -h your-rds-endpoint -U school_admin -d school_db -f consolidated_school_database.sql
```

---

## Performance Optimization

After deployment, consider these optimizations:

### Analyze Tables
```sql
ANALYZE;
```

### Update Statistics
```sql
VACUUM ANALYZE;
```

### Monitor Query Performance
```sql
-- Enable query logging
ALTER DATABASE school_db SET log_statement = 'all';
ALTER DATABASE school_db SET log_duration = on;
```

---

## Security Recommendations

1. **Change Default Passwords**
   ```sql
   -- Change admin password
   UPDATE users 
   SET password_hash = '$2a$10$YOUR_NEW_BCRYPT_HASH' 
   WHERE username = 'admin';
   
   -- Change admin1 password
   UPDATE users 
   SET password_hash = '$2a$10$YOUR_NEW_BCRYPT_HASH' 
   WHERE username = 'admin1';
   ```

2. **Restrict Database Access**
   - Use strong passwords
   - Limit IP access via security groups
   - Enable SSL/TLS connections
   - Use IAM authentication (AWS RDS)

3. **Regular Backups**
   - Enable automated backups (RDS)
   - Test restore procedures
   - Keep backup retention at 7+ days

---

## Support & Documentation

### Related Documents
- **DATABASE-ANALYSIS-SUMMARY.md** - Complete analysis and findings
- **AWS-DATABASE-DEPLOYMENT-PLAN.md** - Detailed deployment plan
- **QUICK-REFERENCE-TABLES.md** - Table structure reference

### Need Help?
1. Check the troubleshooting section above
2. Review application logs
3. Check PostgreSQL logs
4. Verify environment variables
5. Ensure security groups allow access

---

## Version History

- **v1.0** (January 18, 2026) - Initial consolidated script
  - 45 production tables
  - All seed data included
  - Duplicate columns preserved
  - Legacy tables excluded

---

**Script Status:** ✅ Ready for deployment  
**Last Updated:** January 18, 2026  
**Tested On:** PostgreSQL 15.x
