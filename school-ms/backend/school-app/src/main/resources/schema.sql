-- Simplified initial schema creation (no Flyway)
-- Uses CREATE TABLE IF NOT EXISTS so it can be run safely multiple times.
-- Ensure you review types before production; adjust numeric/text sizes as needed.

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

CREATE TABLE IF NOT EXISTS teacher_details (
    id BIGSERIAL PRIMARY KEY,
    department VARCHAR(100),
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    subjects_taught TEXT,
    subjects TEXT,
    years_of_experience INTEGER,
    certifications TEXT,
    educational_background TEXT,
    professional_development TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS ix_courses_active ON courses(is_active);

CREATE TABLE IF NOT EXISTS admissions (
    id BIGSERIAL PRIMARY KEY,
    application_date DATE NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255),
    contact_number VARCHAR(50),
    guardian_name VARCHAR(255),
    guardian_contact VARCHAR(50),
    guardian_email VARCHAR(255),
    address TEXT,
    grade_applying INTEGER,
    previous_school VARCHAR(255),
    previous_grade VARCHAR(50),
    previous_percentage VARCHAR(50),
    blood_group VARCHAR(10),
    medical_conditions TEXT,
    documents BYTEA,
    documents_format VARCHAR(50),
    status VARCHAR(30) DEFAULT 'PENDING',
    rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255) UNIQUE NOT NULL,
    roll_number VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    date_of_birth DATE NOT NULL,
    grade INTEGER NOT NULL,
    section VARCHAR(50) NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    address TEXT,
    gender VARCHAR(20),
    guardian_name VARCHAR(150) NOT NULL,
    guardian_contact VARCHAR(50) NOT NULL,
    guardian_email VARCHAR(255),
    guardian_occupation VARCHAR(150),
    guardian_office_address TEXT,
    aadhar_number VARCHAR(30),
    udise_number VARCHAR(30),
    house_alloted VARCHAR(50),
    guardian_annual_income NUMERIC(15,2),
    previous_school VARCHAR(255),
    tc_number VARCHAR(50),
    tc_reason TEXT,
    tc_date DATE,
    whatsapp_number VARCHAR(30),
    subjects TEXT,
    transport_mode VARCHAR(50),
    bus_route_number VARCHAR(50),
    admission_id BIGINT,
    status VARCHAR(30),
    admission_date DATE,
    photo_url VARCHAR(255),
    blood_group VARCHAR(10),
    medical_conditions TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    modified_by VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS ix_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS ix_students_email ON students(email);
CREATE INDEX IF NOT EXISTS ix_students_grade_section ON students(grade, section);
CREATE INDEX IF NOT EXISTS ix_students_admission_id ON students(admission_id);

-- Simple relationship constraints (added only if target tables exist)
ALTER TABLE school_staff
    ADD CONSTRAINT IF NOT EXISTS fk_school_staff_teacher_details FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id);
ALTER TABLE students
    ADD CONSTRAINT IF NOT EXISTS fk_students_admission FOREIGN KEY (admission_id) REFERENCES admissions(id);

-- Seed minimal reference data (only if missing)
INSERT INTO courses (course_code, name, description, category)
SELECT 'MATH101','Mathematics','Basic math','ACADEMIC'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code='MATH101');
INSERT INTO courses (course_code, name, description, category)
SELECT 'ENG101','English','Basic English','ACADEMIC'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code='ENG101');
