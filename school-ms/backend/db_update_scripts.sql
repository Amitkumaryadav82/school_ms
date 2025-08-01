-- Database Update Scripts
-- These scripts were previously managed by Flyway but are now for manual execution
-- Date: June 19, 2025

-- 1. Add is_active column to staff_roles if it doesn't exist and migrate data
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'staff_roles' AND column_name = 'is_active'
    ) THEN
        -- If the column doesn't exist, add it
        RAISE NOTICE 'Adding is_active column to staff_roles table';
        ALTER TABLE staff_roles ADD COLUMN is_active BOOLEAN;
    ELSE
        RAISE NOTICE 'is_active column already exists in staff_roles table';
    END IF;

    -- Update all existing records where is_active is null to set it to true
    UPDATE staff_roles SET is_active = true WHERE is_active IS NULL;
    
    -- Output the count of updated records
    RAISE NOTICE 'Updated % staff_roles records to set is_active=true', (SELECT COUNT(*) FROM staff_roles WHERE is_active = true);
END $$;

-- 2. Update existing staff_roles records to set is_active to true (simpler version)
-- UPDATE staff_roles SET is_active = true WHERE is_active IS NULL;

-- Note: One of these scripts should be run manually to ensure the staff_roles.is_active column exists
-- and has proper values. Select the appropriate script based on your situation.
