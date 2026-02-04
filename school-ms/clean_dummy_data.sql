-- ============================================================================
-- CLEAN DUMMY DATA FROM SCHOOL MANAGEMENT SYSTEM
-- ============================================================================
-- This script removes all dummy/test data from the database
-- WARNING: This will delete data but preserve the table structure
-- 
-- Usage: psql -U postgres -d school_db -p 5435 -f clean_dummy_data.sql
-- ============================================================================

BEGIN;

-- Display counts before deletion
DO $$
DECLARE
    staff_count INTEGER;
    student_count INTEGER;
    admission_count INTEGER;
    staff_attendance_count INTEGER;
    student_attendance_count INTEGER;
    holiday_count INTEGER;
    fee_structure_count INTEGER;
    transport_route_count INTEGER;
    fee_payment_count INTEGER;
    payment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO staff_count FROM school_staff;
    SELECT COUNT(*) INTO student_count FROM students;
    SELECT COUNT(*) INTO admission_count FROM admissions;
    SELECT COUNT(*) INTO staff_attendance_count FROM staff_attendance;
    SELECT COUNT(*) INTO student_attendance_count FROM attendance;
    SELECT COUNT(*) INTO holiday_count FROM school_holidays;
    SELECT COUNT(*) INTO fee_structure_count FROM fee_structures;
    SELECT COUNT(*) INTO transport_route_count FROM transport_routes;
    SELECT COUNT(*) INTO fee_payment_count FROM fee_payments;
    SELECT COUNT(*) INTO payment_count FROM payments;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATA BEFORE DELETION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Staff Members: %', staff_count;
    RAISE NOTICE 'Students: %', student_count;
    RAISE NOTICE 'Admissions: %', admission_count;
    RAISE NOTICE 'Staff Attendance Records: %', staff_attendance_count;
    RAISE NOTICE 'Student Attendance Records: %', student_attendance_count;
    RAISE NOTICE 'School Holidays: %', holiday_count;
    RAISE NOTICE 'Fee Structures: %', fee_structure_count;
    RAISE NOTICE 'Transport Routes: %', transport_route_count;
    RAISE NOTICE 'Fee Payments: %', fee_payment_count;
    RAISE NOTICE 'Payments: %', payment_count;
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- DELETE DATA (in reverse dependency order)
-- ============================================================================

-- Delete dependent records first
DELETE FROM staff_audit_log;
DELETE FROM in_app_notifications;
DELETE FROM messages;

-- Delete fee-related records
DELETE FROM fee_payments;
DELETE FROM payments;
DELETE FROM student_fee_assignments;
DELETE FROM payment_schedules;
DELETE FROM late_fees;
DELETE FROM fee_payment_schedules;
DELETE FROM fees;

-- Delete exam-related records
DELETE FROM exam_mark_details;
DELETE FROM exam_mark_summaries;
DELETE FROM blueprint_unit_questions;
DELETE FROM blueprint_units;
DELETE FROM question_paper_format;
DELETE FROM exam_configs;
DELETE FROM exam_classes;
DELETE FROM exams;

-- Delete timetable records
DELETE FROM timetable_slots;
DELETE FROM teacher_subject_map;
DELETE FROM teacher_class_map;

-- Delete attendance records
DELETE FROM staff_attendance;
DELETE FROM attendance;

-- Delete transport routes
DELETE FROM transport_routes;

-- Delete fee structures
DELETE FROM fee_structures;

-- Delete students (this will cascade to related records)
DELETE FROM students;

-- Delete admissions
DELETE FROM admissions;

-- Delete staff (this will cascade to related records)
DELETE FROM school_staff;

-- Delete school holidays
DELETE FROM school_holidays;

-- Delete courses and chapters
DELETE FROM chapters;
DELETE FROM courses;

-- Delete teacher details
DELETE FROM teacher_details;

-- Delete class sections
DELETE FROM class_sections;

-- Note: We keep users, roles, grade_levels, sections, classes, subjects
-- as they are core configuration data

-- ============================================================================
-- RESET SEQUENCES (Optional - uncomment if you want to reset IDs)
-- ============================================================================

-- Uncomment these lines if you want to reset auto-increment IDs to 1
-- ALTER SEQUENCE school_staff_id_seq RESTART WITH 1;
-- ALTER SEQUENCE students_id_seq RESTART WITH 1;
-- ALTER SEQUENCE admissions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE staff_attendance_id_seq RESTART WITH 1;
-- ALTER SEQUENCE attendance_id_seq RESTART WITH 1;
-- ALTER SEQUENCE school_holidays_id_seq RESTART WITH 1;
-- ALTER SEQUENCE fee_structures_id_seq RESTART WITH 1;
-- ALTER SEQUENCE transport_routes_id_seq RESTART WITH 1;
-- ALTER SEQUENCE teacher_details_id_seq RESTART WITH 1;
-- ALTER SEQUENCE courses_id_seq RESTART WITH 1;
-- ALTER SEQUENCE chapters_id_seq RESTART WITH 1;

-- Display counts after deletion
DO $$
DECLARE
    staff_count INTEGER;
    student_count INTEGER;
    admission_count INTEGER;
    staff_attendance_count INTEGER;
    student_attendance_count INTEGER;
    holiday_count INTEGER;
    fee_structure_count INTEGER;
    transport_route_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO staff_count FROM school_staff;
    SELECT COUNT(*) INTO student_count FROM students;
    SELECT COUNT(*) INTO admission_count FROM admissions;
    SELECT COUNT(*) INTO staff_attendance_count FROM staff_attendance;
    SELECT COUNT(*) INTO student_attendance_count FROM attendance;
    SELECT COUNT(*) INTO holiday_count FROM school_holidays;
    SELECT COUNT(*) INTO fee_structure_count FROM fee_structures;
    SELECT COUNT(*) INTO transport_route_count FROM transport_routes;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATA AFTER DELETION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Staff Members: %', staff_count;
    RAISE NOTICE 'Students: %', student_count;
    RAISE NOTICE 'Admissions: %', admission_count;
    RAISE NOTICE 'Staff Attendance Records: %', staff_attendance_count;
    RAISE NOTICE 'Student Attendance Records: %', student_attendance_count;
    RAISE NOTICE 'School Holidays: %', holiday_count;
    RAISE NOTICE 'Fee Structures: %', fee_structure_count;
    RAISE NOTICE 'Transport Routes: %', transport_route_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Dummy data cleanup completed!';
    RAISE NOTICE 'Core configuration (users, roles, classes, subjects) preserved';
    RAISE NOTICE '========================================';
END $$;

COMMIT;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
