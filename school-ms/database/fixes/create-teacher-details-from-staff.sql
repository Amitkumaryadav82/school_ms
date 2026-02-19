-- ============================================================================
-- CREATE TEACHER_DETAILS FROM EXISTING STAFF
-- ============================================================================
-- This script creates teacher_details records for existing staff members
-- and links them properly for the substitution feature
-- ============================================================================

BEGIN;

-- Create teacher_details for staff members who don't have one yet
-- (assuming staff with department like 'Teacher%' or specific departments are teachers)
INSERT INTO teacher_details (
    staff_id,
    employee_id,
    specialization,
    qualification,
    experience_years,
    max_periods_per_day,
    department
)
SELECT 
    s.id,
    s.staff_id,
    s.department,
    s.qualifications,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.join_date))::INTEGER,
    5,  -- Default max periods per day
    s.department
FROM school_staff s
WHERE s.is_active = TRUE
  AND s.id NOT IN (SELECT staff_id FROM teacher_details WHERE staff_id IS NOT NULL)
  AND (
      s.department IS NOT NULL 
      AND s.department != ''
      AND s.department NOT IN ('Administration', 'Accounts', 'Library')
  )
ON CONFLICT (staff_id) DO NOTHING;

-- Update school_staff to link to teacher_details
UPDATE school_staff s
SET teacher_details_id = td.id
FROM teacher_details td
WHERE td.staff_id = s.id
  AND s.teacher_details_id IS NULL;

COMMIT;

-- Verification and Summary
DO $$
DECLARE
    total_staff INTEGER;
    total_teacher_details INTEGER;
    linked_staff INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_staff FROM school_staff WHERE is_active = TRUE;
    SELECT COUNT(*) INTO total_teacher_details FROM teacher_details;
    SELECT COUNT(*) INTO linked_staff FROM school_staff WHERE teacher_details_id IS NOT NULL;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TEACHER DETAILS CREATION COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Active Staff: %', total_staff;
    RAISE NOTICE 'Total Teacher Details: %', total_teacher_details;
    RAISE NOTICE 'Staff Linked to Teacher Details: %', linked_staff;
    RAISE NOTICE '========================================';
    
    IF linked_staff = 0 THEN
        RAISE NOTICE 'WARNING: No staff linked to teacher_details!';
        RAISE NOTICE 'This means no teachers will appear in the dropdown.';
        RAISE NOTICE 'Check if your staff have valid departments.';
    ELSE
        RAISE NOTICE 'SUCCESS: Teachers are now available for substitutions!';
        RAISE NOTICE 'Refresh your browser to see them in the dropdown.';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

-- Show the created teacher details
SELECT 
    s.staff_id,
    s.first_name || ' ' || s.last_name as teacher_name,
    s.department,
    td.id as teacher_details_id,
    td.max_periods_per_day
FROM school_staff s
JOIN teacher_details td ON s.teacher_details_id = td.id
WHERE s.is_active = TRUE
ORDER BY s.first_name;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
