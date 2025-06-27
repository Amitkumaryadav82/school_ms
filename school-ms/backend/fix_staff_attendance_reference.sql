-- Fix the staff_attendance table to correctly reference the school_staff table

-- 1. Drop the existing foreign key constraint if it exists
ALTER TABLE staff_attendance DROP CONSTRAINT IF EXISTS staff_attendance_staff_id_fkey;

-- 2. Make sure we have the unique constraint
ALTER TABLE staff_attendance DROP CONSTRAINT IF EXISTS unique_staff_date;
ALTER TABLE staff_attendance ADD CONSTRAINT unique_staff_date UNIQUE (staff_id, attendance_date);

-- 3. Add the foreign key constraint to reference the school_staff table
ALTER TABLE staff_attendance 
ADD CONSTRAINT staff_attendance_staff_id_fkey
FOREIGN KEY (staff_id) REFERENCES school_staff(id) ON DELETE CASCADE;

-- 4. Create a validation function and trigger
CREATE OR REPLACE FUNCTION validate_staff_attendance_insert() 
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM school_staff WHERE id = NEW.staff_id) THEN
        RAISE EXCEPTION 'No staff record found with ID: % in school_staff table', NEW.staff_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a trigger to run the validation function
DROP TRIGGER IF EXISTS validate_staff_attendance_trigger ON staff_attendance;
CREATE TRIGGER validate_staff_attendance_trigger
BEFORE INSERT OR UPDATE ON staff_attendance
FOR EACH ROW EXECUTE FUNCTION validate_staff_attendance_insert();

-- 6. Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON staff_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff_id ON staff_attendance(staff_id);

-- 7. Create or update the trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_staff_attendance_updated_at ON staff_attendance;
CREATE TRIGGER update_staff_attendance_updated_at
BEFORE UPDATE ON staff_attendance
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 8. Show help message
DO $$
BEGIN
    RAISE NOTICE 'Staff attendance table has been updated to correctly reference the school_staff table.';
END $$;
