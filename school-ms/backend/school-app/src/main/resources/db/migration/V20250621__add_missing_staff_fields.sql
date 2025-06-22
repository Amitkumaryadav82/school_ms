-- Ensure all staff fields exist in the database table
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS middle_name VARCHAR(255);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS qualifications TEXT;
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(20);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);

-- Add benefit fields
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS pf_uan VARCHAR(20);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS gratuity VARCHAR(20);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS service_end_date DATE;

-- Add salary fields
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS basic_salary DECIMAL(10, 2);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS hra DECIMAL(10, 2);
ALTER TABLE school_staff ADD COLUMN IF NOT EXISTS da DECIMAL(10, 2);
