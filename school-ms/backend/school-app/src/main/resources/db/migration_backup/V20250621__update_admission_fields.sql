-- Add new columns for additional information
ALTER TABLE admissions ADD COLUMN blood_group VARCHAR(10);
ALTER TABLE admissions ADD COLUMN medical_conditions TEXT;

-- Change the previous_percentage column from DOUBLE to VARCHAR
ALTER TABLE admissions MODIFY previous_percentage VARCHAR(20);

-- Add comment to explain the change
COMMENT ON TABLE admissions IS 'Updated on 2025-06-21: Added blood_group, medical_conditions and changed previous_percentage to VARCHAR';
