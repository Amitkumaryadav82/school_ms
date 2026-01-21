# Schema Comparison Report
## consolidated_school_database.sql vs schema_final.sql

**Date:** January 18, 2026  
**Purpose:** Identify differences between the two database scripts

---

## Executive Summary

Both scripts create similar database structures but have **significant differences** in:
1. **Table count and structure**
2. **Seed data approach**
3. **Foreign key implementation**
4. **Additional tables and features**
5. **User management approach**

---

## Key Differences Overview

| Aspect | consolidated_school_database.sql | schema_final.sql |
|--------|----------------------------------|------------------|
| **Total Tables** | 45 tables | 52+ tables |
| **Approach** | Consolidated from Flyway migrations | Authoritative final schema |
| **FK Strategy** | Direct ALTER TABLE with constraints | Helper function with NOT VALID |
| **Seed Data** | Comprehensive (~100 records) | Minimal (basic setup) |
| **User Table** | Simple structure | Enhanced with auditing |
| **Roles Table** | Separate roles table | Integrated in users table |
| **Legacy Tables** | Excluded | Included (marked deprecated) |
| **Library Module** | Not included | Included (books, book_issues) |
| **Timetable** | Basic structure | Advanced (substitutions, requirements) |

---

## Detailed Differences

### 1. TABLES PRESENT IN schema_final.sql BUT MISSING IN consolidated_school_database.sql

#### A. Library Management (2 tables)
```sql
-- schema_final.sql has these:
books
book_issues
```
**Impact:** Library functionality won't work with consolidated script

#### B. Advanced Timetable Features (3 tables)
```sql
-- schema_final.sql has these:
timetable_class_settings      -- Per-class/section overrides
timetable_requirements         -- Subject requirements per class
timetable_substitutions        -- Teacher substitutions
```
**Impact:** Advanced timetable features won't work

#### C. Legacy HRM Tables (4 tables)
```sql
-- schema_final.sql includes (marked deprecated):
hrm_staff_designations
hrm_staff_roles
hrm_staff_designation_mappings
teachers (legacy)
```
**Impact:** These are deprecated but schema_final keeps them for backward compatibility

#### D. Message Management (2 tables)
```sql
-- schema_final.sql has these:
message_recipients
message_read_status
```
**Impact:** Message tracking features won't work properly

---

### 2. TABLES PRESENT IN consolidated_school_database.sql BUT MISSING IN schema_final.sql

#### A. Authentication Tables
```sql
-- consolidated_school_database.sql has:
roles                    -- Separate roles table
user_roles              -- User-role junction table
```
**Impact:** schema_final.sql uses role column in users table instead

#### B. Additional Tables
```sql
-- consolidated_school_database.sql has:
question_paper_format   -- Exam question formats
```
**Impact:** Question paper formatting won't work in schema_final

---

### 3. STRUCTURAL DIFFERENCES IN COMMON TABLES

#### A. users Table

**consolidated_school_database.sql:**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150),
    full_name VARCHAR(100),
    enabled BOOLEAN DEFAULT TRUE,
    account_non_expired BOOLEAN DEFAULT TRUE,
    account_non_locked BOOLEAN DEFAULT TRUE,
    credentials_non_expired BOOLEAN DEFAULT TRUE,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**schema_final.sql:**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(40),                    -- ← Role embedded in users
    enabled BOOLEAN DEFAULT TRUE,
    account_non_expired BOOLEAN DEFAULT TRUE,
    account_non_locked BOOLEAN DEFAULT TRUE,
    credentials_non_expired BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),             -- ← Audit fields
    modified_by VARCHAR(100)             -- ← Audit fields
);
```

**Key Differences:**
- schema_final has `role` column directly in users table
- schema_final has audit fields (created_by, modified_by)
- schema_final has stricter NOT NULL constraints
- schema_final uses TEXT for password_hash (vs VARCHAR(255))

#### B. school_staff Table

**Both are very similar, but:**

**consolidated_school_database.sql:**
```sql
-- Includes these additional fields:
ta DOUBLE PRECISION,
other_allowance DOUBLE PRECISION,
city VARCHAR(100),
state VARCHAR(100),
pin_code VARCHAR(10),
nationality VARCHAR(50),
religion VARCHAR(50),
category VARCHAR(50),
marital_status VARCHAR(20),
```

**schema_final.sql:**
```sql
-- Missing the above fields
-- More minimal structure
```

**Impact:** consolidated script has more comprehensive staff data fields

#### C. school_holidays Table

**consolidated_school_database.sql:**
```sql
CREATE TABLE school_holidays (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**schema_final.sql:**
```sql
CREATE TABLE school_holidays (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,           -- ← Additional field
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),             -- ← Audit fields
    modified_by VARCHAR(100)             -- ← Audit fields
);
```

**Key Differences:**
- schema_final has `type` field
- schema_final has audit fields
- schema_final doesn't have UNIQUE constraint on date

#### D. staff_roles Table

**consolidated_school_database.sql:**
```sql
CREATE TABLE staff_roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);
```

**schema_final.sql:**
```sql
CREATE TABLE staff_roles (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(255),              -- ← Different column name
    description TEXT,
    is_active BOOLEAN
);
```

**Key Differences:**
- Column name: `name` vs `role_name`
- No UNIQUE constraint in schema_final
- No DEFAULT TRUE in schema_final

#### E. employees Table

**consolidated_school_database.sql:**
```sql
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**schema_final.sql:**
```sql
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(255),
    email VARCHAR(255),
    department VARCHAR(100),
    position VARCHAR(100),               -- ← Different field name
    is_active BOOLEAN DEFAULT TRUE       -- ← Additional field
);
```

**Key Differences:**
- schema_final splits name into first_name/last_name
- schema_final uses `position` instead of `designation`
- schema_final has `is_active` field
- schema_final missing employee_id, phone, timestamps

---

### 4. FOREIGN KEY IMPLEMENTATION DIFFERENCES

**consolidated_school_database.sql:**
```sql
-- Direct foreign key creation
CONSTRAINT fk_school_staff_role FOREIGN KEY (role_id) REFERENCES staff_roles(id),
CONSTRAINT fk_school_staff_teacher FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id)
```

**schema_final.sql:**
```sql
-- Uses helper function for idempotent FK creation
CREATE OR REPLACE FUNCTION add_fk_if_absent(p_table text, p_constraint text, p_def text) ...

SELECT add_fk_if_absent('school_staff','fk_school_staff_teacher_details','FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id)');
SELECT add_fk_if_absent('school_staff','fk_school_staff_role','FOREIGN KEY (role_id) REFERENCES staff_roles(id)');
```

**Key Differences:**
- schema_final uses NOT VALID constraints (for existing data compatibility)
- schema_final attempts to validate constraints after seed data
- consolidated script creates constraints directly

---

### 5. SEED DATA DIFFERENCES

#### A. Admin Users

**consolidated_school_database.sql:**
```sql
-- Creates 2 admin users:
INSERT INTO users (id, username, password_hash, email, full_name, ...)
VALUES (1, 'admin', '$2a$10$Dow1b0CQpZK0s8AjtKq6uO2dQ.wc2u/.1ytY1/6YrXOvNhbbX6n1K', 
        'admin@schoolms.com', 'System Administrator', ...);

INSERT INTO users (username, password_hash, email, full_name, ...)
VALUES ('admin1', '$2a$10$1bYp1SiyNLKn.z2QL8Iceu8Yw2GxWfZpXeQJcDjuCwaBlDg9uVkie',
        'admin1@schoolms.com', 'Secondary Administrator', ...);
```

**schema_final.sql:**
```sql
-- Creates 1 admin user with different format:
INSERT INTO users (username, full_name, email, password_hash, role)
SELECT 'admin2', 'Administrator', 'admin2@example.com', 
       '{bcrypt}$2b$12$2BSSkrJ7Dg2lq8rUUS3vSebw2GQFQn4CqYVOfnQeQy8H2oQJpYwN2', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin2');
```

**Key Differences:**
- Different usernames: admin/admin1 vs admin2
- Different password format: $2a$ vs {bcrypt}$2b$
- Different email domains: schoolms.com vs example.com
- schema_final uses role column directly

#### B. Roles

**consolidated_school_database.sql:**
```sql
-- Creates 6 roles in separate roles table:
INSERT INTO roles (id, name, description) VALUES
    (1, 'ADMIN', 'Administrator role'),
    (2, 'TEACHER', 'Teacher role'),
    (3, 'STUDENT', 'Student role'),
    (4, 'PARENT', 'Parent role'),
    ('ROLE_ADMIN', 'Administrator role (alternative naming)'),
    ('ROLE_USER', 'Standard user role');
```

**schema_final.sql:**
```sql
-- No separate roles table
-- Roles embedded in users.role column
```

#### C. Staff Roles

**consolidated_school_database.sql:**
```sql
INSERT INTO staff_roles (name, description, is_active) VALUES
    ('Teacher', 'Teaching staff member', TRUE),
    ('Principal', 'School principal', TRUE),
    ('Admin', 'Administrative staff', TRUE),
    ('Librarian', 'Library management', TRUE),
    ('Management', 'School management', TRUE),
    ('Account Officer', 'Finance department', TRUE);
```

**schema_final.sql:**
```sql
INSERT INTO staff_roles (role_name, description, is_active)
SELECT 'ADMIN','Administrator role', TRUE ...
SELECT 'TEACHER','Teacher role', TRUE ...
SELECT 'ACCOUNTANT','Accounts role', TRUE ...
```

**Key Differences:**
- Different role names (Teacher vs TEACHER)
- Different number of roles (6 vs 3)
- Different column name (name vs role_name)

#### D. Grade Levels & Sections

**consolidated_school_database.sql:**
```sql
-- Explicit INSERT with all 12 grades
INSERT INTO grade_levels (grade_number, name, description) VALUES
    (1, 'Grade 1', 'First grade - Elementary level'),
    (2, 'Grade 2', 'Second grade - Elementary level'),
    ... (all 12 grades explicitly listed)

-- Explicit INSERT with all 26 sections
INSERT INTO sections (section_name, description) VALUES
    ('A', 'Section A'),
    ('B', 'Section B'),
    ... (all 26 sections A-Z explicitly listed)
```

**schema_final.sql:**
```sql
-- Uses generate_series for grades
INSERT INTO grade_levels (grade_number, name, description)
SELECT g, CONCAT('Grade ', g), CASE 
    WHEN g BETWEEN 1 AND 5 THEN 'Elementary level'
    WHEN g BETWEEN 6 AND 8 THEN 'Middle school level'
    WHEN g BETWEEN 9 AND 12 THEN 'High school level' END
FROM generate_series(1,12) AS g
WHERE NOT EXISTS (SELECT 1 FROM grade_levels);

-- Only creates sections A-D (not A-Z)
INSERT INTO sections (section_name, description)
SELECT v, CONCAT('Section ', v)
FROM (VALUES ('A'),('B'),('C'),('D')) AS s(v)
WHERE NOT EXISTS (SELECT 1 FROM sections);
```

**Key Differences:**
- schema_final uses PostgreSQL generate_series (more elegant)
- schema_final only creates 4 sections (A-D) vs 26 sections (A-Z)
- schema_final uses conditional logic for descriptions

#### E. Subjects

**consolidated_school_database.sql:**
```sql
-- No subject seed data
```

**schema_final.sql:**
```sql
-- Seeds 10 subjects
INSERT INTO subjects (name, code, description, max_marks, theory_marks, practical_marks)
VALUES
    ('Mathematics','MATH01','Core mathematics',100,100,0),
    ('English Language','ENG01','English language skills',100,100,0),
    ('Science','SCI01','General science',100,90,10),
    ... (10 subjects total)
```

**Impact:** schema_final provides ready-to-use subjects

#### F. Classes

**consolidated_school_database.sql:**
```sql
-- No class seed data
```

**schema_final.sql:**
```sql
-- Seeds 12 classes
INSERT INTO classes (name)
SELECT v FROM (VALUES
 ('Class 1'),('Class 2'),('Class 3'),('Class 4'),('Class 5'),('Class 6'),
 ('Class 7'),('Class 8'),('Class 9'),('Class 10'),('Class 11'),('Class 12')
) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM classes);
```

**Impact:** schema_final provides ready-to-use classes

---

### 6. MISSING TABLES COMPARISON

#### Tables in consolidated_school_database.sql ONLY:
1. roles
2. user_roles
3. question_paper_format
4. staff_audit_log

#### Tables in schema_final.sql ONLY:
1. books
2. book_issues
3. hrm_staff_designations (deprecated)
4. hrm_staff_roles (deprecated)
5. hrm_staff_designation_mappings (deprecated)
6. teachers (deprecated)
7. timetable_class_settings
8. timetable_requirements
9. timetable_substitutions
10. message_recipients
11. message_read_status

---

### 7. INDEX DIFFERENCES

**consolidated_school_database.sql:**
- More comprehensive indexing
- Includes unique index for teacher double-booking prevention
- Separate index creation section

**schema_final.sql:**
- Indexes created inline with tables
- Less comprehensive indexing
- No teacher double-booking prevention index

---

### 8. TRIGGER DIFFERENCES

**consolidated_school_database.sql:**
```sql
-- Creates reusable trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column() ...

-- Applies to multiple tables
CREATE TRIGGER update_school_staff_updated_at ...
CREATE TRIGGER update_students_updated_at ...
CREATE TRIGGER update_users_updated_at ...
```

**schema_final.sql:**
```sql
-- No triggers defined
-- Relies on application-level timestamp updates
```

---

## Compatibility Issues

### 1. Authentication System
- **consolidated**: Uses separate roles table with user_roles junction
- **schema_final**: Uses role column in users table
- **Impact**: Application code must be updated to match chosen approach

### 2. Staff Roles
- **consolidated**: Uses `name` column
- **schema_final**: Uses `role_name` column
- **Impact**: Queries must use correct column name

### 3. Library Module
- **consolidated**: No library tables
- **schema_final**: Has library tables
- **Impact**: Library features won't work with consolidated script

### 4. Advanced Timetable
- **consolidated**: Basic timetable only
- **schema_final**: Advanced features (substitutions, requirements)
- **Impact**: Advanced timetable features won't work with consolidated script

### 5. Message Tracking
- **consolidated**: Basic messages table
- **schema_final**: Enhanced with recipients and read status
- **Impact**: Message tracking features limited in consolidated script

---

## Recommendations

### Option 1: Use consolidated_school_database.sql IF:
✅ You want comprehensive seed data (admin users, grades, sections)  
✅ You prefer separate roles table architecture  
✅ You don't need library management  
✅ You don't need advanced timetable features  
✅ You want automatic timestamp triggers  
✅ You want cleaner structure without deprecated tables  

### Option 2: Use schema_final.sql IF:
✅ You need library management functionality  
✅ You need advanced timetable features (substitutions, requirements)  
✅ You prefer role embedded in users table  
✅ You want comprehensive subject seed data  
✅ You need backward compatibility with legacy HRM tables  
✅ You prefer idempotent FK creation with NOT VALID  

### Option 3: Merge Both Scripts (Recommended)
Create a hybrid script that includes:
- Comprehensive seed data from consolidated script
- Library tables from schema_final
- Advanced timetable tables from schema_final
- Trigger functions from consolidated script
- Choose one authentication approach (separate roles vs embedded)

---

## Summary Table

| Feature | consolidated_school_database.sql | schema_final.sql | Winner |
|---------|----------------------------------|------------------|--------|
| **Seed Data** | Comprehensive (~100 records) | Minimal (basic setup) | consolidated |
| **Library Module** | ❌ Missing | ✅ Included | schema_final |
| **Advanced Timetable** | ❌ Basic only | ✅ Full featured | schema_final |
| **Triggers** | ✅ Automated | ❌ None | consolidated |
| **Legacy Tables** | ✅ Excluded | ⚠️ Included (deprecated) | consolidated |
| **Auth System** | Separate roles table | Embedded role | Depends on preference |
| **Documentation** | ✅ Extensive | ⚠️ Minimal | consolidated |
| **FK Strategy** | Direct constraints | NOT VALID + validation | schema_final |
| **Idempotency** | Good | Better | schema_final |

---

## Action Items

1. **Decide on authentication approach**: Separate roles table vs embedded role
2. **Add library tables** to consolidated script if needed
3. **Add advanced timetable tables** to consolidated script if needed
4. **Choose staff_roles column name**: `name` vs `role_name`
5. **Decide on sections**: 4 sections (A-D) vs 26 sections (A-Z)
6. **Add subject seed data** to consolidated script
7. **Add class seed data** to consolidated script
8. **Test both scripts** on a test database
9. **Merge best features** from both scripts

---

**Conclusion:**

Both scripts are functional but serve slightly different purposes:
- **consolidated_school_database.sql** is better for fresh deployments with comprehensive setup
- **schema_final.sql** is better for existing systems needing backward compatibility

For a new AWS deployment, I recommend **merging both scripts** to get the best of both worlds.

---

**Document Version:** 1.0  
**Last Updated:** January 18, 2026
