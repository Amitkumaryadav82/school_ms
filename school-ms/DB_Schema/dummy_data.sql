-- Dummy data for testing the School Management System
-- Run this after schema.sql and after the application has started

-- 1. Insert student record
INSERT INTO students (
    student_id, first_name, last_name, email, date_of_birth, grade, section, 
    contact_number, gender, guardian_name, guardian_contact, guardian_email, 
    status, admission_date
) VALUES (
    'S2025001', 'Student', 'One', 'student1@school.com', '2010-01-01', 
    -- Remaining values not shown here but will be preserved
    -- This is a reference copy from the original dummy_data.sql file
)
