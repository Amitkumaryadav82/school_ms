-- Ensure all staff with is_active = true have employment_status = 'ACTIVE'
UPDATE school_staff
SET employment_status = 'ACTIVE'
WHERE is_active = true AND (employment_status IS NULL OR employment_status != 'ACTIVE');

-- Set employment_status = 'TERMINATED' for staff with is_active = false
UPDATE school_staff
SET employment_status = 'TERMINATED'
WHERE is_active = false AND (employment_status IS NULL OR employment_status != 'TERMINATED');

-- Create a comment explaining the migration
COMMENT ON COLUMN school_staff.employment_status IS 'Staff employment status (ACTIVE, TERMINATED, ON_LEAVE, etc.) - This is now the primary status field replacing is_active';
