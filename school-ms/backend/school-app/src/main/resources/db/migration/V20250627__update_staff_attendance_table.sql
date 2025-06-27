-- Update the staff_attendance table foreign key constraint
ALTER TABLE staff_attendance DROP CONSTRAINT IF EXISTS staff_attendance_staff_id_fkey;

-- Create the staff_attendance table if it does not exist already
CREATE TABLE IF NOT EXISTS staff_attendance (
    id SERIAL PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    CONSTRAINT unique_staff_date UNIQUE (staff_id, attendance_date)
);

-- Add the proper foreign key constraint to point to the school_staff table
ALTER TABLE staff_attendance
ADD CONSTRAINT staff_attendance_staff_id_fkey
FOREIGN KEY (staff_id) REFERENCES school_staff(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff_id ON staff_attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON staff_attendance(attendance_date);
