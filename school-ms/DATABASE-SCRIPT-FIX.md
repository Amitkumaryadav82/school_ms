# Database Script Fix - January 22, 2026

## Issue
The consolidated database script was failing with duplicate key errors when executed in pgAdmin.

## Root Cause
The script had INSERT statements that mixed explicit IDs with auto-generated IDs from sequences:

1. **Roles Table**: 
   - First INSERT used explicit IDs (1-4)
   - Second INSERT without IDs tried to use sequence starting at 1
   - Result: Duplicate key error on id=1

2. **Users Table**:
   - First INSERT used explicit ID (1)
   - Second INSERT without ID tried to use sequence starting at 1
   - Result: Duplicate key error on id=1

## Fix Applied

### 1. Roles Table (Line 842-852)
**Before:**
```sql
INSERT INTO roles (id, name, description) VALUES
    (1, 'ADMIN', 'Administrator role'),
    (2, 'TEACHER', 'Teacher role'),
    (3, 'STUDENT', 'Student role'),
    (4, 'PARENT', 'Parent role')
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (name, description) VALUES
    ('ROLE_ADMIN', 'Administrator role (alternative naming)'),
    ('ROLE_USER', 'Standard user role')
ON CONFLICT (name) DO NOTHING;
```

**After:**
```sql
INSERT INTO roles (id, name, description) VALUES
    (1, 'ADMIN', 'Administrator role'),
    (2, 'TEACHER', 'Teacher role'),
    (3, 'STUDENT', 'Student role'),
    (4, 'PARENT', 'Parent role'),
    (5, 'ROLE_ADMIN', 'Administrator role (alternative naming)'),
    (6, 'ROLE_USER', 'Standard user role')
ON CONFLICT (id) DO NOTHING;

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
```

### 2. Users Table (Line 859-889)
**Before:**
```sql
INSERT INTO users (id, username, ...) VALUES (1, 'admin', ...)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (username, ...) 
SELECT 'admin1', ...
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin1');
```

**After:**
```sql
INSERT INTO users (id, username, ...) VALUES (1, 'admin', ...)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, username, ...) VALUES (2, 'admin1', ...)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
```

## Changes Made
1. Combined multiple INSERT statements into single statements with explicit IDs
2. Added sequence reset commands after each table with explicit IDs
3. Ensured all seed data uses explicit IDs to avoid sequence conflicts

## How to Use
1. Drop existing `school_db` database in pgAdmin
2. Create fresh `school_db` database
3. Execute the updated `consolidated_school_database.sql` script
4. Script should complete without errors

## Expected Output
- NOTICE messages about "table does not exist, skipping" are normal (from DROP TABLE IF EXISTS)
- No ERROR messages should appear
- Final summary should show:
  - Total Tables Created: 45
  - Roles: 6
  - Users: 2
  - Grade Levels: 12
  - Sections: 26
  - Class Sections: 48
  - Staff Roles: 6

## Files Modified
- `school-ms/consolidated_school_database.sql`
