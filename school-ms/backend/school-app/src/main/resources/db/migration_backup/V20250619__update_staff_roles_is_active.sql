-- Update existing staff_roles records to set is_active to true
UPDATE staff_roles SET is_active = true WHERE is_active IS NULL;
