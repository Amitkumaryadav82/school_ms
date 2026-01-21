# AWS PostgreSQL Database Deployment Plan
## Single Consolidated Script Approach

**Document Version:** 1.0  
**Date:** January 18, 2026  
**Database:** PostgreSQL for AWS RDS  
**Application:** School Management System

---

## Executive Summary

This document provides a comprehensive plan for creating a single consolidated PostgreSQL database script for AWS RDS deployment. The script will replace the current Flyway migration approach with a single executable SQL file.

### Key Decisions:
✅ **Single consolidated script** (no Flyway dependency)  
✅ **Keep all duplicate columns** (for backward compatibility during testing)  
✅ **Remove all legacy tables** (hrm_staff, consolidated_staff, etc.)  
✅ **Include all seed data** (admin users, grades, sections, roles)

---

## Complete Table Inventory

### Production Tables (45 tables total)

#### **1. Authentication & Authorization (3 tables)**
- `users` - User accounts
- `roles` - User roles (ADMIN, TEACHER, STUDENT, PARENT)
- `user_roles` - User-role mapping (junction table)

#### **2. Core Staff Management (3 tables)**
- `school_staff` - **PRIMARY** consolidated staff table
- `staff_roles` - Staff role definitions
- `teacher_details` - Teacher-specific information

#### **3. Student Management (2 tables)**
- `students` - Student records
- `admissions` - Admission applications

#### **4. Attendance (3 tables)**
- `attendance` - Student attendance records
- `staff_attendance` - Staff/teacher attendance records
- `school_holidays` - Holiday calendar for auto-attendance

#### **5. Academic Structure (6 tables)**
- `grade_levels` - Grades 1-12
- `sections` - Sections A-Z
- `class_sections` - Grade-section combinations
- `courses` - Course catalog
- `subjects` - Subject definitions
- `classes` - Class definitions
- `chapters` - Course chapter breakdown

#### **6. Timetable Management (4 tables)**
- `timetable_slots` - Class schedule slots
- `timetable_settings` - Timetable configuration
- `teacher_class_map` - Teacher-class assignments
- `teacher_subject_map` - Teacher-subject assignments

#### **7. Exam Management (8 tables)**
- `exams` - Exam records
- `exam_classes` - Exam-class mapping (junction table)
- `exam_configs` - Exam configurations
- `exam_mark_summaries` - Student exam results summary
- `exam_mark_details` - Detailed marks breakdown
- `question_paper_format` - Question paper templates
- `blueprint_units` - Exam blueprint units
- `blueprint_unit_questions` - Blueprint unit questions

#### **8. Fee Management (10 tables)**
- `fees` - Fee records
- `fee_structures` - Fee structure by grade
- `fee_payments` - Payment transactions
- `fee_payment_schedules` - Payment schedule templates
- `late_fees` - Late fee penalties
- `student_fee_assignments` - Student-fee mappings
- `payment_schedules` - Payment schedule definitions
- `payments` - General payment records
- `transport_routes` - Transport route fees

#### **9. Communication (2 tables)**
- `messages` - Internal messaging system
- `in_app_notifications` - In-app notifications

#### **10. Settings & Configuration (2 tables)**
- `school_settings` - School-wide settings
- `employees` - Employee records (if different from staff)

#### **11. Audit & Logging (1 table)**
- `staff_audit_log` - Staff-related audit trail

---

## Legacy Tables to EXCLUDE

These tables will NOT be included in the consolidated script:

❌ `hrm_staff` - Migrated to school_staff  
❌ `consolidated_staff` - Migrated to school_staff  
❌ `staff` - Migrated to school_staff  
❌ `example_staff` - Migrated to school_staff  
❌ `hrm_staff_designations` - Legacy HRM table  
❌ `hrm_staff_designation_mappings` - Legacy HRM table  
❌ `hrm_staff_roles` - Replaced by staff_roles  
❌ `teachers` (hrm.entity.Teacher) - Replaced by teacher_details

---

## Critical Table: school_staff

### All Columns (Including Duplicates)

```sql
CREATE TABLE school_staff (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Unique Identifiers
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    
    -- Contact Information (KEEP BOTH)
    phone VARCHAR(30),
    phone_number VARCHAR(30),
    address TEXT,
    emergency_contact VARCHAR(100),
    
    -- Employment Dates (KEEP ALL THREE)
    join_date DATE,
    joining_date DATE,
    date_of_joining DATE,
    termination_date DATE,
    service_end_date DATE,
    
    -- Employment Status (KEEP BOTH)
    employment_status VARCHAR(30) DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    
    -- Role Information
    role_id BIGINT,
    role VARCHAR(50),
    department VARCHAR(100),
    designation VARCHAR(100),
    
    -- Qualifications
    qualifications TEXT,
    
    -- Financial Information
    basic_salary DOUBLE PRECISION,
    hra DOUBLE PRECISION,
    da DOUBLE PRECISION,
    pf_uan VARCHAR(50),
    gratuity VARCHAR(50),
    
    -- Profile
    profile_image VARCHAR(255),
    
    -- Relationships
    user_id BIGINT,
    teacher_details_id BIGINT,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_school_staff_role FOREIGN KEY (role_id) REFERENCES staff_roles(id),
    CONSTRAINT fk_school_staff_teacher FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id)
);
```

---

## Seed Data Requirements

### 1. Roles (4 records)
```sql
INSERT INTO roles (id, name, description) VALUES
  (1, 'ADMIN', 'Administrator role'),
  (2, 'TEACHER', 'Teacher role'),
  (3, 'STUDENT', 'Student role'),
  (4, 'PARENT', 'Parent role');
```

### 2. Admin Users (2 users)

**User 1: admin**
- Username: `admin`
- Password: `ChangeMe_Initial1!` (bcrypt hash)
- Email: `admin@schoolms.com`
- Role: ADMIN

**User 2: admin1**
- Username: `admin1`
- Password: `qwerty` (bcrypt hash)
- Email: `admin1@schoolms.com`
- Role: ADMIN

### 3. Grade Levels (12 records)
Grades 1-12 with descriptions

### 4. Sections (26 records)
Sections A-Z with descriptions

### 5. Class Sections (48 records)
Combinations of Grades 1-12 × Sections A-D for academic year 2025-2026

### 6. Staff Roles (6 records)
- Teacher
- Principal
- Admin
- Librarian
- Management
- Account Officer

### 7. Sample Courses (2 records)
- Mathematics 101
- English Literature

---

## Script Structure & Execution Order

### Phase 1: Drop Existing Objects (Optional)
```sql
-- Drop tables in reverse dependency order
-- Only if you want a clean slate
```

### Phase 2: Create Tables (Dependency Order)

**Level 1: Independent Tables (No Foreign Keys)**
1. roles
2. users
3. grade_levels
4. sections
5. staff_roles
6. school_holidays
7. school_settings
8. subjects
9. classes

**Level 2: Tables with Level 1 Dependencies**
10. user_roles (depends on: users, roles)
11. class_sections (depends on: grade_levels, sections)
12. teacher_details (independent, but referenced by school_staff)
13. admissions (independent initially)
14. courses (independent)
15. chapters (depends on: courses)

**Level 3: Tables with Level 2 Dependencies**
16. school_staff (depends on: staff_roles, teacher_details)
17. students (depends on: admissions)
18. fee_structures (independent)
19. exams (independent)
20. timetable_settings (independent)

**Level 4: Tables with Level 3 Dependencies**
21. attendance (depends on: students)
22. staff_attendance (depends on: school_staff)
23. teacher_class_map (depends on: teacher_details, classes)
24. teacher_subject_map (depends on: teacher_details, subjects)
25. timetable_slots (depends on: classes, teacher_details)
26. exam_classes (depends on: exams, classes)
27. exam_configs (depends on: exams)
28. question_paper_format (independent)
29. blueprint_units (independent)

**Level 5: Complex Dependencies**
30. exam_mark_summaries (depends on: exams, subjects, students)
31. exam_mark_details (depends on: exam_mark_summaries, question_paper_format)
32. blueprint_unit_questions (depends on: blueprint_units)
33. fees (independent)
34. fee_payments (depends on: fee_structures)
35. fee_payment_schedules (depends on: fee_structures)
36. late_fees (depends on: fee_structures)
37. payment_schedules (depends on: fee_structures)
38. student_fee_assignments (depends on: students, fee_structures)
39. payments (depends on: students)
40. transport_routes (independent)
41. messages (depends on: users)
42. in_app_notifications (depends on: users)
43. employees (independent)
44. staff_audit_log (depends on: school_staff)

### Phase 3: Create Indexes
- Primary key indexes (automatic)
- Foreign key indexes
- Unique constraint indexes
- Performance indexes

### Phase 4: Create Triggers
- `update_school_staff_modtime` - Auto-update updated_at timestamp

### Phase 5: Insert Seed Data
1. roles
2. users
3. user_roles
4. grade_levels
5. sections
6. class_sections
7. staff_roles
8. courses (sample data)

---

## Key Considerations

### 1. Duplicate Columns Strategy
**Decision:** Keep ALL duplicate columns for now

**Rationale:**
- Application code may reference any of these columns
- Testing phase will identify which columns are actually used
- Can be removed in Phase 2 after validation

**Affected Columns:**
- `phone` vs `phone_number`
- `join_date` vs `joining_date` vs `date_of_joining`
- `is_active` vs `active`
- `subjects_taught` vs `subjects` (in teacher_details)

### 2. Foreign Key Constraints
**Critical:** Ensure proper FK references:
- `staff_attendance.staff_id` → `school_staff.id` (NOT legacy staff table)
- `students.admission_id` → `admissions.id`
- `attendance.student_id` → `students.id`
- `school_staff.role_id` → `staff_roles.id`
- `school_staff.teacher_details_id` → `teacher_details.id`

### 3. Unique Constraints
**Important unique constraints:**
- `attendance`: (student_id, date)
- `staff_attendance`: (staff_id, attendance_date)
- `timetable_slots`: (class_id, section_id, day_of_week, period_no)
- `class_sections`: (grade_id, section_id, academic_year)

### 4. Enum Types
**Handle as VARCHAR with application-level validation:**
- `EmploymentStatus`: ACTIVE, TERMINATED, ON_LEAVE, RETIRED
- `AttendanceStatus`: PRESENT, ABSENT, LATE, EXCUSED
- `StaffAttendanceStatus`: PRESENT, ABSENT, HOLIDAY, LEAVE, HALF_DAY
- `AdmissionStatus`: PENDING, UNDER_REVIEW, APPROVED, REJECTED, WAITLISTED, CANCELLED, ENROLLED
- `FeeType`: TUITION, EXAM, LIBRARY, LABORATORY, TRANSPORTATION, OTHER
- `FeeFrequency`: ONE_TIME, MONTHLY, QUARTERLY, ANNUALLY

### 5. Audit Fields
**Standard audit columns (via Auditable base class):**
- `created_at TIMESTAMP`
- `updated_at TIMESTAMP`
- `created_by VARCHAR(255)`
- `modified_by VARCHAR(255)`

---

## AWS RDS Configuration

### Recommended Instance Settings
```
Instance Class: db.t3.medium (2 vCPU, 4 GB RAM)
Storage: 100 GB SSD (gp3)
PostgreSQL Version: 15.x
Multi-AZ: Yes (for production)
Backup Retention: 7 days
Maintenance Window: Sunday 03:00-04:00 UTC
```

### Connection Pool Settings
```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.connection-timeout=30000
```

### Security Group Rules
```
Inbound:
- PostgreSQL (5432) from Application Security Group
- PostgreSQL (5432) from Bastion Host (for admin access)

Outbound:
- All traffic (default)
```

---

## Application Configuration Changes

### 1. Disable Flyway
```properties
# application-prod.properties
spring.flyway.enabled=false
spring.jpa.hibernate.ddl-auto=none
```

### 2. Database Connection
```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
```

### 3. Environment Variables
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://your-rds-endpoint.region.rds.amazonaws.com:5432/school_db
SPRING_DATASOURCE_USERNAME=school_admin
SPRING_DATASOURCE_PASSWORD=<secure-password>
JWT_SECRET=<base64-encoded-secret>
JWT_EXPIRATION=86400000
ALLOWED_ORIGINS=https://your-domain.com
```

---

## Deployment Steps

### Step 1: Create RDS Instance
1. Launch PostgreSQL RDS instance in AWS
2. Configure security groups
3. Enable automated backups
4. Note down endpoint URL

### Step 2: Create Database
```sql
CREATE DATABASE school_db
    WITH 
    OWNER = school_admin
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

### Step 3: Execute Consolidated Script
```bash
psql -h your-rds-endpoint.region.rds.amazonaws.com \
     -U school_admin \
     -d school_db \
     -f consolidated_school_db.sql
```

### Step 4: Verify Deployment
```sql
-- Check table count
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: 45 tables

-- Check seed data
SELECT COUNT(*) FROM roles;          -- Expected: 4
SELECT COUNT(*) FROM users;          -- Expected: 2
SELECT COUNT(*) FROM grade_levels;   -- Expected: 12
SELECT COUNT(*) FROM sections;       -- Expected: 26
SELECT COUNT(*) FROM staff_roles;    -- Expected: 6
```

### Step 5: Deploy Application
1. Update application.properties with RDS endpoint
2. Set environment variables
3. Deploy Spring Boot application
4. Test all functionality

---

## Testing Checklist

### Database Level
- [ ] All 45 tables created successfully
- [ ] All foreign key constraints working
- [ ] All unique constraints enforced
- [ ] All indexes created
- [ ] Seed data inserted correctly
- [ ] Triggers functioning

### Application Level
- [ ] Application starts without errors
- [ ] User authentication works (admin/admin1)
- [ ] Staff CRUD operations
- [ ] Student CRUD operations
- [ ] Attendance marking (students)
- [ ] Attendance marking (staff)
- [ ] Holiday attendance automation
- [ ] Fee management
- [ ] Exam management
- [ ] Timetable management

### Performance Testing
- [ ] Query response times acceptable
- [ ] Connection pool working efficiently
- [ ] No N+1 query issues
- [ ] Indexes being used properly

---

## Rollback Plan

### If Deployment Fails:
1. **Database Level:**
   ```sql
   DROP DATABASE school_db;
   -- Recreate and try again
   ```

2. **Application Level:**
   - Revert to previous deployment
   - Check application logs
   - Verify environment variables

3. **Data Recovery:**
   - Restore from RDS automated backup
   - Point-in-time recovery available

---

## Next Steps

### Immediate Actions:
1. ✅ Review this document
2. ⏳ Create consolidated SQL script (DO NOT EXECUTE YET)
3. ⏳ Test script on local PostgreSQL instance
4. ⏳ Validate with application startup locally
5. ⏳ Get approval for AWS deployment

### Post-Deployment:
1. Monitor application logs
2. Monitor database performance
3. Test all functionality thoroughly
4. Identify unused duplicate columns
5. Plan Phase 2 cleanup (remove duplicates)

---

## Important Notes

### Password Hashes
The seed data includes bcrypt password hashes:
- **admin**: `ChangeMe_Initial1!` → `$2a$10$Dow1b0CQpZK0s8AjtKq6uO2dQ.wc2u/.1ytY1/6YrXOvNhbbX6n1K`
- **admin1**: `qwerty` → `$2a$10$1bYp1SiyNLKn.z2QL8Iceu8Yw2GxWfZpXeQJcDjuCwaBlDg9uVkie`

**SECURITY WARNING:** Change these passwords immediately after first login in production!

### Column Name Conflicts
The `users` table has TWO possible password column names:
- `password` (legacy)
- `password_hash` (modern)

The consolidated script should use `password_hash` as it's the current standard.

### Academic Year
Default academic year in seed data: `2025-2026`
Update this in the script if deploying for a different year.

---

## Contact & Support

For questions or issues during deployment:
1. Review application logs: `/var/log/school-app/`
2. Check RDS logs in AWS CloudWatch
3. Verify environment variables are set correctly
4. Ensure security groups allow database access

---

**Document End**
