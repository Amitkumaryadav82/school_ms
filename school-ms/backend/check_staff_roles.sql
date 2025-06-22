-- Check the role values in the school_staff table
SELECT staff_id, first_name, last_name, role, role_id
FROM school_staff
ORDER BY id;

-- Check the role names from staff_roles table
SELECT id, name, description, is_active
FROM staff_roles
ORDER BY id;

-- Check join between school_staff and staff_roles
SELECT s.staff_id, s.first_name, s.last_name, s.role, r.id as role_id, r.name as role_name
FROM school_staff s
LEFT JOIN staff_roles r ON s.role_id = r.id
ORDER BY s.id;
