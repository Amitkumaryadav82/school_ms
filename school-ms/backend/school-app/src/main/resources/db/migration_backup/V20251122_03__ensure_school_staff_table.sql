-- Ensure consolidated school_staff table exists (idempotent)
-- Creates required columns aligning with com.school.core.model.Staff entity
CREATE TABLE IF NOT EXISTS school_staff (
    id BIGSERIAL PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    phone_number VARCHAR(30),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    join_date DATE,
    joining_date DATE,
    termination_date DATE,
    department VARCHAR(100),
    designation VARCHAR(100),
    date_of_joining DATE,
    employment_status VARCHAR(30) DEFAULT 'ACTIVE',
    role_id BIGINT,
    role VARCHAR(50),
    user_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    qualifications TEXT,
    emergency_contact VARCHAR(100),
    blood_group VARCHAR(10),
    profile_image VARCHAR(255),
    pf_uan VARCHAR(50),
    gratuity VARCHAR(50),
    service_end_date DATE,
    basic_salary DOUBLE PRECISION,
    hra DOUBLE PRECISION,
    da DOUBLE PRECISION,
    teacher_details_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_school_staff_staff_id ON school_staff(staff_id);
CREATE INDEX IF NOT EXISTS ix_school_staff_email ON school_staff(email);
CREATE INDEX IF NOT EXISTS ix_school_staff_role_id ON school_staff(role_id);
CREATE INDEX IF NOT EXISTS ix_school_staff_user_id ON school_staff(user_id);

-- Optional FK constraints (guard with existence checks)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='staff_roles') THEN
        EXECUTE 'ALTER TABLE school_staff ADD CONSTRAINT IF NOT EXISTS fk_school_staff_role FOREIGN KEY (role_id) REFERENCES staff_roles(id)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='teacher_details') THEN
        EXECUTE 'ALTER TABLE school_staff ADD CONSTRAINT IF NOT EXISTS fk_school_staff_teacher FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id)';
    END IF;
END $$;
