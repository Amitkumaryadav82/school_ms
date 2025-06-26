-- Add this to your schema.sql file or execute as a separate migration script

-- Create staff_attendance table
CREATE TABLE IF NOT EXISTS staff_attendance (
    id BIGSERIAL PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    CONSTRAINT unique_staff_date UNIQUE (staff_id, attendance_date)
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
CREATE TRIGGER update_staff_attendance_updated_at
BEFORE UPDATE ON staff_attendance
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for common queries
CREATE INDEX idx_staff_attendance_date ON staff_attendance(attendance_date);
CREATE INDEX idx_staff_attendance_staff_id ON staff_attendance(staff_id);
