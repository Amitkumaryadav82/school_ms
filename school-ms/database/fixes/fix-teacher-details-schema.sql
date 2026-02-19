-- ============================================================================
-- FIX TEACHER_DETAILS SCHEMA FOR SUBSTITUTIONS
-- ============================================================================
-- This script adds the missing staff_id column to teacher_details table
-- and other columns needed for the substitution feature
-- ============================================================================

BEGIN;

-- Add staff_id column to link teacher_details to school_staff
ALTER TABLE teacher_details 
ADD COLUMN IF NOT EXISTS staff_id BIGINT;

-- Add foreign key constraint
ALTER TABLE teacher_details
ADD CONSTRAINT IF NOT EXISTS fk_teacher_details_staff
FOREIGN KEY (staff_id) REFERENCES school_staff(id);

-- Add unique constraint on staff_id (one teacher_details per staff)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_teacher_details_staff_id'
    ) THEN
        ALTER TABLE teacher_details 
        ADD CONSTRAINT uq_teacher_details_staff_id UNIQUE (staff_id);
    END IF;
END $$;

-- Add other missing columns needed for substitutions
ALTER TABLE teacher_details
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50);

ALTER TABLE teacher_details
ADD COLUMN IF NOT EXISTS experience_years INTEGER;

ALTER TABLE teacher_details
ADD COLUMN IF NOT EXISTS max_periods_per_day INTEGER DEFAULT 5;

-- Add teacher_details_id column to school_staff if it doesn't exist
ALTER TABLE school_staff
ADD COLUMN IF NOT EXISTS teacher_details_id BIGINT;

-- Add foreign key from school_staff to teacher_details
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_school_staff_teacher_details'
    ) THEN
        ALTER TABLE school_staff
        ADD CONSTRAINT fk_school_staff_teacher_details
        FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id);
    END IF;
END $$;

COMMIT;

-- Verification
DO $$
DECLARE
    staff_id_exists BOOLEAN;
    teacher_details_id_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teacher_details' AND column_name = 'staff_id'
    ) INTO staff_id_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'school_staff' AND column_name = 'teacher_details_id'
    ) INTO teacher_details_id_exists;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TEACHER_DETAILS SCHEMA FIX COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'teacher_details.staff_id column exists: %', staff_id_exists;
    RAISE NOTICE 'school_staff.teacher_details_id column exists: %', teacher_details_id_exists;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next step: Run dummy_data_seed_india.sql Part 15';
    RAISE NOTICE 'to populate teacher data for substitutions';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
