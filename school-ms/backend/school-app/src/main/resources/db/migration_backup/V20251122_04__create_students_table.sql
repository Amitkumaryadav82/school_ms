-- Create students table aligning with com.school.student.model.Student (idempotent)
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

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='admissions') THEN
        EXECUTE 'ALTER TABLE students ADD CONSTRAINT IF NOT EXISTS fk_students_admission FOREIGN KEY (admission_id) REFERENCES admissions(id)';
    END IF;
END $$;
