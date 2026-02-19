-- ============================================================================
-- FIX DATABASE FOR TEACHER SUBSTITUTIONS FEATURE
-- ============================================================================
-- This script safely adds the timetable_substitutions table
-- Safe to run even if table already exists
-- 
-- Usage: psql -U postgres -d school_db -p 5435 -f fix-database-for-substitutions.sql
-- ============================================================================

BEGIN;

-- Add substitutions table (idempotent - safe to re-run)
CREATE TABLE IF NOT EXISTS timetable_substitutions (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    class_id BIGINT NOT NULL,
    section_id BIGINT NOT NULL,
    period_no INTEGER NOT NULL,
    original_teacher_details_id BIGINT,
    substitute_teacher_details_id BIGINT,
    reason VARCHAR(255),
    approved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subst_class FOREIGN KEY (class_id) REFERENCES classes(id),
    CONSTRAINT fk_subst_original_teacher FOREIGN KEY (original_teacher_details_id) REFERENCES teacher_details(id),
    CONSTRAINT fk_subst_substitute_teacher FOREIGN KEY (substitute_teacher_details_id) REFERENCES teacher_details(id),
    CONSTRAINT uq_substitution UNIQUE (date, class_id, section_id, period_no)
);

-- Create index for faster lookups by date
CREATE INDEX IF NOT EXISTS idx_substitutions_date ON timetable_substitutions(date);

-- Create index for faster lookups by teacher
CREATE INDEX IF NOT EXISTS idx_substitutions_original_teacher ON timetable_substitutions(original_teacher_details_id);
CREATE INDEX IF NOT EXISTS idx_substitutions_substitute_teacher ON timetable_substitutions(substitute_teacher_details_id);

COMMIT;

-- Display success message
DO $
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE FIX COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Table timetable_substitutions is now ready';
    RAISE NOTICE 'You can now rebuild and deploy the application';
    RAISE NOTICE '========================================';
END $;
