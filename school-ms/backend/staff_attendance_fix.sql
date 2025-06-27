-- Drop the existing foreign key constraint
ALTER TABLE staff_attendance DROP CONSTRAINT IF EXISTS staff_attendance_staff_id_fkey;

-- Add the new foreign key constraint pointing to the correct table
ALTER TABLE staff_attendance ADD CONSTRAINT staff_attendance_staff_id_fkey 
    FOREIGN KEY (staff_id) REFERENCES school_staff(id) ON DELETE CASCADE;

-- If you also need to migrate existing data, use this:
-- Update existing staff_attendance records with staff_id values that exist in school_staff
-- DELETE FROM staff_attendance WHERE staff_id NOT IN (SELECT id FROM school_staff);

-- Create a database function to validate staff IDs during inserts
CREATE OR REPLACE FUNCTION validate_staff_attendance_insert() 
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM school_staff WHERE id = NEW.staff_id) THEN
        RAISE EXCEPTION 'No staff record found with ID: %', NEW.staff_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the validation function
DROP TRIGGER IF EXISTS validate_staff_attendance_trigger ON staff_attendance;
CREATE TRIGGER validate_staff_attendance_trigger
BEFORE INSERT OR UPDATE ON staff_attendance
FOR EACH ROW EXECUTE FUNCTION validate_staff_attendance_insert();
