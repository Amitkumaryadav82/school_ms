-- ============================================================================
-- CHECK TEACHER DATA FOR SUBSTITUTIONS
-- ============================================================================
-- This script checks if you have the necessary data for teacher substitutions
-- ============================================================================

-- Check staff members
SELECT 'STAFF MEMBERS' as check_type, COUNT(*) as count FROM school_staff;

-- Check teacher_details
SELECT 'TEACHER DETAILS' as check_type, COUNT(*) as count FROM teacher_details;

-- Check staff with teacher_details linkage
SELECT 'STAFF WITH TEACHER DETAILS' as check_type, COUNT(*) as count 
FROM school_staff 
WHERE teacher_details_id IS NOT NULL;

-- Show staff members and their teacher_details status
SELECT 
    s.id as staff_id,
    s.staff_id as staff_code,
    s.first_name,
    s.last_name,
    s.department,
    s.teacher_details_id,
    CASE 
        WHEN s.teacher_details_id IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END as has_teacher_details
FROM school_staff s
ORDER BY s.id
LIMIT 20;

-- Show teacher_details records
SELECT 
    td.id,
    td.staff_id,
    s.first_name,
    s.last_name,
    td.specialization,
    td.max_periods_per_day
FROM teacher_details td
LEFT JOIN school_staff s ON td.staff_id = s.id
LIMIT 20;

-- Check if teacher_details_id column exists in school_staff
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'school_staff' 
AND column_name = 'teacher_details_id';

-- ============================================================================
-- INTERPRETATION:
-- ============================================================================
-- If "STAFF WITH TEACHER DETAILS" count is 0, you need to:
-- 1. Run dummy_data_seed_india.sql (creates teacher_details and links them)
-- OR
-- 2. Manually create teacher_details for your existing staff
-- ============================================================================
