-- Staff Tables Migration Script
-- This script creates a consolidated staff table and migrates data from legacy tables
-- Author: GitHub Copilot
-- Date: June 14, 2025
-- For PostgreSQL database

-- Create the consolidated staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS school_staff (
    id BIGSERIAL PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    phone_number VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    join_date DATE,
    joining_date DATE,
    termination_date DATE,
    department VARCHAR(100),
    employment_status VARCHAR(20) DEFAULT 'ACTIVE',
    role_id BIGINT,
    role VARCHAR(50),
    user_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    qualifications TEXT,
    emergency_contact VARCHAR(100),
    blood_group VARCHAR(5),
    profile_image VARCHAR(255),
    pf_uan VARCHAR(50),
    gratuity VARCHAR(50),
    service_end_date DATE,
    basic_salary DOUBLE PRECISION,
    hra DOUBLE PRECISION,
    da DOUBLE PRECISION,
    ta DOUBLE PRECISION,
    other_allowance DOUBLE PRECISION,
    city VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(10),
    nationality VARCHAR(50),
    religion VARCHAR(50),
    category VARCHAR(50),
    marital_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_id ON school_staff(staff_id);
CREATE INDEX IF NOT EXISTS idx_email ON school_staff(email);
CREATE INDEX IF NOT EXISTS idx_role_id ON school_staff(role_id);
CREATE INDEX IF NOT EXISTS idx_user_id ON school_staff(user_id);

-- Check if hrm_staff table exists first
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hrm_staff') THEN
        -- Migrate data from hrm_staff table
        INSERT INTO school_staff (
            id, staff_id, first_name, last_name, email, phone_number, address, date_of_birth,
            gender, join_date, termination_date, employment_status, role_id, user_id,
            is_active, qualifications, emergency_contact, blood_group, profile_image,
            pf_uan, gratuity, service_end_date, basic_salary, hra
        )
        SELECT 
            hs.id, hs.staff_id, hs.first_name, hs.last_name, hs.email, hs.phone_number, hs.address, 
            hs.hrm_date_of_birth, hs.gender, hs.join_date, hs.termination_date, hs.employment_status, 
            hs.role_id, hs.user_id, hs.is_active, hs.qualifications, hs.emergency_contact, 
            hs.blood_group, hs.profile_image, hs.pf_uan, hs.gratuity, hs.service_end_date, 
            hs.basic_salary, hs.hra
        FROM hrm_staff hs
        ON CONFLICT(staff_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            phone_number = EXCLUDED.phone_number,
            address = EXCLUDED.address,
            date_of_birth = EXCLUDED.date_of_birth,
            gender = EXCLUDED.gender,
            join_date = EXCLUDED.join_date,
            termination_date = EXCLUDED.termination_date,
            employment_status = EXCLUDED.employment_status,
            role_id = EXCLUDED.role_id,
            user_id = EXCLUDED.user_id,
            is_active = EXCLUDED.is_active,
            qualifications = EXCLUDED.qualifications,
            emergency_contact = EXCLUDED.emergency_contact,
            blood_group = EXCLUDED.blood_group,
            profile_image = EXCLUDED.profile_image,
            pf_uan = EXCLUDED.pf_uan,
            gratuity = EXCLUDED.gratuity,
            service_end_date = EXCLUDED.service_end_date,
            basic_salary = EXCLUDED.basic_salary,
            hra = EXCLUDED.hra;
        RAISE NOTICE 'Migrated data from hrm_staff table';
    ELSE
        RAISE NOTICE 'Table hrm_staff does not exist, skipping migration from this table';
    END IF;
END $$;

-- Check if staff table exists first
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'staff') THEN
        -- Migrate data from staff table
        INSERT INTO school_staff (
            id, staff_id, first_name, middle_name, last_name, email, phone, phone_number, address
        )
        SELECT 
            s.id, s.staff_id, s.first_name, s.middle_name, s.last_name, s.email, s.phone, 
            s.phone_number, s.address
        FROM staff s
        ON CONFLICT(staff_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            middle_name = EXCLUDED.middle_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            phone_number = EXCLUDED.phone_number,
            address = EXCLUDED.address;
        RAISE NOTICE 'Migrated data from staff table';
    ELSE
        RAISE NOTICE 'Table staff does not exist, skipping migration from this table';
    END IF;
END $$;

-- Check if example_staff table exists first
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'example_staff') THEN
        -- Migrate data from example_staff table
        INSERT INTO school_staff (
            id, staff_id, first_name, middle_name, last_name, email, phone
        )
        SELECT 
            es.id, es.staff_id, es.first_name, es.middle_name, es.last_name, es.email, es.phone
        FROM example_staff es
        ON CONFLICT(staff_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            middle_name = EXCLUDED.middle_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone;
        RAISE NOTICE 'Migrated data from example_staff table';
    ELSE
        RAISE NOTICE 'Table example_staff does not exist, skipping migration from this table';
    END IF;
END $$;

-- Check if consolidated_staff table exists first
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'consolidated_staff') THEN
        -- Migrate data from consolidated_staff table
        INSERT INTO school_staff (
            id, staff_id, first_name, last_name, email, phone_number, address, date_of_birth,
            gender, join_date, employment_status, role_id, role
        )
        SELECT 
            cs.id, cs.staff_id, cs.first_name, cs.last_name, cs.email, cs.phone_number, cs.address, 
            cs.date_of_birth, cs.gender, cs.join_date, cs.employment_status, cs.role_id, cs.role
        FROM consolidated_staff cs
        ON CONFLICT(staff_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            phone_number = EXCLUDED.phone_number,
            address = EXCLUDED.address,
            date_of_birth = EXCLUDED.date_of_birth,
            gender = EXCLUDED.gender,
            join_date = EXCLUDED.join_date,
            employment_status = EXCLUDED.employment_status,
            role_id = EXCLUDED.role_id,
            role = EXCLUDED.role;
        RAISE NOTICE 'Migrated data from consolidated_staff table';
    ELSE
        RAISE NOTICE 'Table consolidated_staff does not exist, skipping migration from this table';
    END IF;
END $$;

-- Update joining_date to match join_date for consistency
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'school_staff') THEN
        UPDATE school_staff
        SET joining_date = join_date
        WHERE joining_date IS NULL AND join_date IS NOT NULL;
        RAISE NOTICE 'Updated joining_date fields for consistency';
    END IF;
END $$;

-- Create a trigger to keep updated_at current (PostgreSQL equivalent of MySQL's ON UPDATE CURRENT_TIMESTAMP)
CREATE OR REPLACE FUNCTION update_school_staff_changetimestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_school_staff_modtime
BEFORE UPDATE ON school_staff
FOR EACH ROW
EXECUTE PROCEDURE update_school_staff_changetimestamp();

-- Add foreign key constraints (only after all data is migrated)
-- ALTER TABLE school_staff
--     ADD CONSTRAINT fk_school_staff_role FOREIGN KEY (role_id) REFERENCES staff_roles(id);
--
-- ALTER TABLE school_staff
--     ADD CONSTRAINT fk_school_staff_user FOREIGN KEY (user_id) REFERENCES users(id);

-- Once migration is verified and all references are updated, you can drop the legacy tables
-- WARNING: Only drop tables after you've confirmed all code changes are complete
-- DROP TABLE IF EXISTS hrm_staff;
-- DROP TABLE IF EXISTS staff;
-- DROP TABLE IF EXISTS example_staff;
-- DROP TABLE IF EXISTS consolidated_staff;
