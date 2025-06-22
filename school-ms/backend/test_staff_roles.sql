-- SQL to check staff roles in the database

-- Check staff roles in the staff_roles table
SELECT id, name, description, is_active FROM staff_roles ORDER BY id;

-- Check the number of staff with each role
SELECT role, COUNT(*) as count 
FROM school_staff 
GROUP BY role 
ORDER BY count DESC;

-- Check how role_id and role columns are used in the school_staff table
SELECT staff_id, first_name, last_name, role, role_id 
FROM school_staff 
ORDER BY last_name, first_name;

-- Check for staff members with no role or role_id
SELECT staff_id, first_name, last_name, department 
FROM school_staff 
WHERE (role IS NULL OR role = '') AND role_id IS NULL;

-- Check the department distribution
SELECT department, COUNT(*) as count 
FROM school_staff 
WHERE department IS NOT NULL
GROUP BY department 
ORDER BY count DESC;
