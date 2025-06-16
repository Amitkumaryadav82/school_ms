-- Migration script to rename tables and update column names
-- This should be executed during a maintenance window

-- First, back up the existing tables
CREATE TABLE staff_backup AS SELECT * FROM staff;
CREATE TABLE hrm_staff_backup AS SELECT * FROM hrm_staff;

-- Create the new consolidated table structure
CREATE TABLE school_staff (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255),
    phone_number VARCHAR(255),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(50),
    join_date DATE,
    joining_date DATE,
    termination_date DATE,
    department VARCHAR(255),
    employment_status VARCHAR(50) DEFAULT 'ACTIVE',
    role_id BIGINT,
    role VARCHAR(255),
    user_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    qualifications TEXT,
    emergency_contact VARCHAR(255),
    blood_group VARCHAR(50),
    profile_image VARCHAR(255),
    pf_uan VARCHAR(255),
    gratuity VARCHAR(255),
    service_end_date DATE,
    basic_salary NUMERIC,
    hra NUMERIC,
    da NUMERIC
);

-- Migrate data from staff table to the new consolidated table
INSERT INTO school_staff (
    id, staff_id, first_name, middle_name, last_name, email, 
    phone, phone_number, address, date_of_birth, joining_date, 
    department, role, active, is_active
)
SELECT 
    id, staff_id, first_name, middle_name, last_name, email,
    phone, phone_number, address, date_of_birth, joining_date,
    department, role, active, active
FROM staff;

-- Migrate data from hrm_staff table to the new consolidated table
-- This needs careful column mapping to avoid duplicates
INSERT INTO school_staff (
    staff_id, first_name, last_name, email, phone_number,
    address, date_of_birth, gender, join_date, termination_date,
    employment_status, role_id, user_id, is_active,
    qualifications, emergency_contact, blood_group, profile_image,
    pf_uan, gratuity, service_end_date, basic_salary, hra, da
)
SELECT 
    s.staff_id, s.first_name, s.last_name, s.email, s.phone_number,
    s.address, s.date_of_birth, s.gender, s.join_date, s.termination_date,
    s.employment_status::VARCHAR, s.role_id, s.user_id, s.is_active,
    s.qualifications, s.emergency_contact, s.blood_group, s.profile_image,
    s.pf_uan, s.gratuity, s.service_end_date, s.basic_salary, s.hra, s.da
FROM hrm_staff s
WHERE NOT EXISTS (
    SELECT 1 FROM school_staff ss WHERE ss.staff_id = s.staff_id OR ss.email = s.email
);

-- Update foreign keys that reference the old staff tables
-- This will need to be customized based on your schema
-- For example:
-- ALTER TABLE teacher_details
--    ADD CONSTRAINT fk_teacher_details_school_staff
--    FOREIGN KEY (staff_id) 
--    REFERENCES school_staff(id);

-- Only drop the old tables after verifying the migration was successful
-- DROP TABLE staff;
-- DROP TABLE hrm_staff;
