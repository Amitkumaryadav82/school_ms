-- ============================================================================
-- CONSOLIDATED SCHOOL MANAGEMENT SYSTEM DATABASE SCRIPT
-- ============================================================================
-- Database: PostgreSQL 14.x / 15.x / 16.x
-- Purpose: Single consolidated script for AWS RDS deployment
-- Created: January 18, 2026
-- 
-- IMPORTANT NOTES:
-- 1. This script consolidates 33 Flyway migration files
-- 2. All duplicate columns are kept for backward compatibility
-- 3. Legacy tables (hrm_staff, consolidated_staff, etc.) are EXCLUDED
-- 4. All seed data is included
-- 5. Execute this script on a fresh PostgreSQL database
--
-- USAGE:
--   psql -h your-rds-endpoint -U school_admin -d school_db -f consolidated_school_database.sql
--
-- DEFAULT ADMIN CREDENTIALS (CHANGE IMMEDIATELY AFTER FIRST LOGIN):
--   Username: admin    Password: ChangeMe_Initial1!
--   Username: admin1   Password: qwerty
-- ============================================================================

-- Set client encoding
SET client_encoding = 'UTF8';

-- ============================================================================
-- SECTION 1: DROP EXISTING OBJECTS (Optional - Uncomment if needed)
-- ============================================================================
-- WARNING: This will delete all existing data!
-- Uncomment the following lines only if you want a clean slate

DROP TABLE IF EXISTS staff_audit_log CASCADE;
DROP TABLE IF EXISTS in_app_notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS transport_routes CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS student_fee_assignments CASCADE;
DROP TABLE IF EXISTS payment_schedules CASCADE;
DROP TABLE IF EXISTS late_fees CASCADE;
DROP TABLE IF EXISTS fee_payment_schedules CASCADE;
DROP TABLE IF EXISTS fee_payments CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS blueprint_unit_questions CASCADE;
DROP TABLE IF EXISTS blueprint_units CASCADE;
DROP TABLE IF EXISTS exam_mark_details CASCADE;
DROP TABLE IF EXISTS exam_mark_summaries CASCADE;
DROP TABLE IF EXISTS question_paper_format CASCADE;
DROP TABLE IF EXISTS exam_configs CASCADE;
DROP TABLE IF EXISTS exam_classes CASCADE;
DROP TABLE IF EXISTS timetable_slots CASCADE;
DROP TABLE IF EXISTS teacher_subject_map CASCADE;
DROP TABLE IF EXISTS teacher_class_map CASCADE;
DROP TABLE IF EXISTS timetable_settings CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS staff_attendance CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS school_staff CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS admissions CASCADE;
DROP TABLE IF EXISTS teacher_details CASCADE;
DROP TABLE IF EXISTS class_sections CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS school_settings CASCADE;
DROP TABLE IF EXISTS school_holidays CASCADE;
DROP TABLE IF EXISTS staff_roles CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS grade_levels CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- ============================================================================
-- SECTION 2: CREATE TABLES (In Dependency Order)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- LEVEL 1: Independent Tables (No Foreign Keys)
-- ----------------------------------------------------------------------------

-- Table: roles
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- Table: users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150),
    full_name VARCHAR(100),
    enabled BOOLEAN DEFAULT TRUE,
    account_non_expired BOOLEAN DEFAULT TRUE,
    account_non_locked BOOLEAN DEFAULT TRUE,
    credentials_non_expired BOOLEAN DEFAULT TRUE,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: grade_levels
CREATE TABLE grade_levels (
    id SERIAL PRIMARY KEY,
    grade_number INTEGER NOT NULL CHECK (grade_number BETWEEN 1 AND 12),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_grade_number UNIQUE (grade_number)
);

-- Table: sections
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(5) NOT NULL CHECK (section_name ~ '^[A-Z]$'),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_section_name UNIQUE (section_name)
);

-- Table: staff_roles
CREATE TABLE staff_roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- Table: school_holidays
CREATE TABLE school_holidays (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: school_settings
CREATE TABLE school_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: subjects
CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    max_marks INTEGER,
    theory_marks INTEGER,
    practical_marks INTEGER
);

-- Table: classes
CREATE TABLE classes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Table: employees
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- LEVEL 2: Tables with Level 1 Dependencies
-- ----------------------------------------------------------------------------

-- Table: user_roles (junction table)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Table: class_sections
CREATE TABLE class_sections (
    id SERIAL PRIMARY KEY,
    grade_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    capacity INTEGER DEFAULT 40,
    room_number VARCHAR(10),
    academic_year VARCHAR(9) DEFAULT '2025-2026',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_grade_id FOREIGN KEY (grade_id) REFERENCES grade_levels(id) ON DELETE CASCADE,
    CONSTRAINT fk_section_id FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    CONSTRAINT uq_grade_section_year UNIQUE (grade_id, section_id, academic_year)
);

-- Table: teacher_details
CREATE TABLE teacher_details (
    id BIGSERIAL PRIMARY KEY,
    department VARCHAR(255),
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    subjects_taught TEXT,
    subjects TEXT,
    years_of_experience INTEGER,
    certifications TEXT,
    educational_background TEXT,
    professional_development TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: admissions
CREATE TABLE admissions (
    id BIGSERIAL PRIMARY KEY,
    application_date DATE NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    guardian_name VARCHAR(255) NOT NULL,
    guardian_contact VARCHAR(30) NOT NULL,
    guardian_email VARCHAR(255),
    address TEXT,
    grade_applying INTEGER NOT NULL,
    previous_school VARCHAR(255),
    previous_grade VARCHAR(50),
    previous_percentage VARCHAR(20),
    blood_group VARCHAR(10),
    medical_conditions TEXT,
    documents BYTEA,
    documents_format VARCHAR(50),
    status VARCHAR(30) DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255)
);

-- Table: courses
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    course_code VARCHAR(50),
    name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: chapters
CREATE TABLE chapters (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    course_id BIGINT,
    chapter_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chapters_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- LEVEL 3: Tables with Level 2 Dependencies
-- ----------------------------------------------------------------------------

-- Table: school_staff (CRITICAL - Consolidated Staff Table)
CREATE TABLE school_staff (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Unique Identifiers
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    
    -- Contact Information (KEEP BOTH for backward compatibility)
    phone VARCHAR(30),
    phone_number VARCHAR(30),
    address TEXT,
    emergency_contact VARCHAR(100),
    
    -- Employment Dates (KEEP ALL THREE for backward compatibility)
    join_date DATE,
    joining_date DATE,
    date_of_joining DATE,
    termination_date DATE,
    service_end_date DATE,
    
    -- Employment Status (KEEP BOTH for backward compatibility)
    employment_status VARCHAR(30) DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    
    -- Role Information
    role_id BIGINT,
    role VARCHAR(50),
    department VARCHAR(100),
    designation VARCHAR(100),
    
    -- Qualifications
    qualifications TEXT,
    
    -- Financial Information
    basic_salary DOUBLE PRECISION,
    hra DOUBLE PRECISION,
    da DOUBLE PRECISION,
    ta DOUBLE PRECISION,
    other_allowance DOUBLE PRECISION,
    pf_uan VARCHAR(50),
    gratuity VARCHAR(50),
    
    -- Address Details
    city VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(10),
    nationality VARCHAR(50),
    religion VARCHAR(50),
    category VARCHAR(50),
    marital_status VARCHAR(20),
    
    -- Profile
    profile_image VARCHAR(255),
    
    -- Relationships
    user_id BIGINT,
    teacher_details_id BIGINT,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_school_staff_role FOREIGN KEY (role_id) REFERENCES staff_roles(id),
    CONSTRAINT fk_school_staff_teacher FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id)
);

-- Table: students
CREATE TABLE students (
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
    guardian_annual_income NUMERIC(15,2),
    aadhar_number VARCHAR(30),
    udise_number VARCHAR(30),
    house_alloted VARCHAR(50),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    modified_by VARCHAR(100),
    CONSTRAINT fk_students_admission FOREIGN KEY (admission_id) REFERENCES admissions(id)
);

-- Table: fee_structures
CREATE TABLE fee_structures (
    id BIGSERIAL PRIMARY KEY,
    class_grade INTEGER NOT NULL UNIQUE,
    annual_fees NUMERIC(15,2) NOT NULL,
    building_fees NUMERIC(15,2) NOT NULL,
    lab_fees NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255)
);

-- Table: exams
CREATE TABLE exams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE
);

-- Table: timetable_settings
CREATE TABLE timetable_settings (
    id BIGSERIAL PRIMARY KEY,
    working_days_mask INTEGER,
    periods_per_day INTEGER,
    period_duration_min INTEGER,
    lunch_after_period INTEGER,
    max_periods_per_teacher_per_day INTEGER,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- LEVEL 4: Tables with Level 3 Dependencies
-- ----------------------------------------------------------------------------

-- Table: attendance
CREATE TABLE attendance (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(20) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT uq_attendance_student_date UNIQUE (student_id, date)
);

-- Table: staff_attendance
CREATE TABLE staff_attendance (
    id SERIAL PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    CONSTRAINT fk_staff_attendance_staff FOREIGN KEY (staff_id) REFERENCES school_staff(id),
    CONSTRAINT uq_staff_attendance_staff_date UNIQUE (staff_id, attendance_date)
);

-- Table: teacher_class_map
CREATE TABLE teacher_class_map (
    id BIGSERIAL PRIMARY KEY,
    teacher_details_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    section VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teacher_class_teacher FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id),
    CONSTRAINT fk_teacher_class_class FOREIGN KEY (class_id) REFERENCES classes(id),
    CONSTRAINT uq_teacher_class_section UNIQUE (teacher_details_id, class_id, section)
);

-- Table: teacher_subject_map
CREATE TABLE teacher_subject_map (
    id BIGSERIAL PRIMARY KEY,
    teacher_details_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teacher_subject_teacher FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id),
    CONSTRAINT fk_teacher_subject_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Table: timetable_slots
CREATE TABLE timetable_slots (
    id BIGSERIAL PRIMARY KEY,
    version BIGINT,
    class_id BIGINT NOT NULL,
    section_id BIGINT NOT NULL,
    day_of_week INTEGER NOT NULL,
    period_no INTEGER NOT NULL,
    subject_id BIGINT,
    teacher_details_id BIGINT,
    locked BOOLEAN DEFAULT FALSE,
    generated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_timetable_class FOREIGN KEY (class_id) REFERENCES classes(id),
    CONSTRAINT fk_timetable_teacher FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id),
    CONSTRAINT uq_timetable_slot UNIQUE (class_id, section_id, day_of_week, period_no)
);

-- Table: exam_classes (junction table)
CREATE TABLE exam_classes (
    exam_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    PRIMARY KEY (exam_id, class_id),
    CONSTRAINT fk_exam_classes_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_classes_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Table: exam_configs
CREATE TABLE exam_configs (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    config_key VARCHAR(255) NOT NULL,
    config_value TEXT,
    CONSTRAINT fk_exam_config_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Table: question_paper_format
CREATE TABLE question_paper_format (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    marks_per_question INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: blueprint_units
CREATE TABLE blueprint_units (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weightage INTEGER
);

-- ----------------------------------------------------------------------------
-- LEVEL 5: Complex Dependencies
-- ----------------------------------------------------------------------------

-- Table: exam_mark_summaries
CREATE TABLE exam_mark_summaries (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    total_marks NUMERIC(5,2),
    obtained_marks NUMERIC(5,2),
    grade VARCHAR(5),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_summary_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_summary_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_exam_summary_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT uq_exam_subject_student UNIQUE (exam_id, subject_id, student_id)
);

-- Table: exam_mark_details
CREATE TABLE exam_mark_details (
    id BIGSERIAL PRIMARY KEY,
    summary_id BIGINT NOT NULL,
    question_format_id BIGINT NOT NULL,
    marks_obtained NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_detail_summary FOREIGN KEY (summary_id) REFERENCES exam_mark_summaries(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_detail_format FOREIGN KEY (question_format_id) REFERENCES question_paper_format(id),
    CONSTRAINT uq_summary_format UNIQUE (summary_id, question_format_id)
);

-- Table: blueprint_unit_questions
CREATE TABLE blueprint_unit_questions (
    id BIGSERIAL PRIMARY KEY,
    blueprint_unit_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    marks INTEGER,
    CONSTRAINT fk_blueprint_question_unit FOREIGN KEY (blueprint_unit_id) REFERENCES blueprint_units(id) ON DELETE CASCADE
);

-- Table: fees
CREATE TABLE fees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    grade INTEGER NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    due_date DATE NOT NULL,
    fee_type VARCHAR(50) NOT NULL,
    description TEXT,
    frequency VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255)
);

-- Table: fee_payments
CREATE TABLE fee_payments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    fee_structure_id BIGINT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'COMPLETED',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    CONSTRAINT fk_fee_payment_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_fee_payment_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id)
);

-- Table: fee_payment_schedules
CREATE TABLE fee_payment_schedules (
    id BIGSERIAL PRIMARY KEY,
    fee_structure_id BIGINT NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    CONSTRAINT fk_fee_schedule_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE
);

-- Table: late_fees
CREATE TABLE late_fees (
    id BIGSERIAL PRIMARY KEY,
    fee_structure_id BIGINT NOT NULL,
    days_late INTEGER NOT NULL,
    penalty_amount NUMERIC(15,2) NOT NULL,
    penalty_percentage NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    CONSTRAINT fk_late_fee_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE
);

-- Table: payment_schedules
CREATE TABLE payment_schedules (
    id BIGSERIAL PRIMARY KEY,
    fee_structure_id BIGINT NOT NULL,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    CONSTRAINT fk_payment_schedule_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE
);

-- Table: student_fee_assignments
CREATE TABLE student_fee_assignments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    fee_structure_id BIGINT NOT NULL,
    assigned_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    CONSTRAINT fk_student_fee_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_fee_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id)
);

-- Table: payments
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'COMPLETED',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Table: transport_routes
CREATE TABLE transport_routes (
    id BIGSERIAL PRIMARY KEY,
    route_name VARCHAR(255) NOT NULL,
    route_number VARCHAR(50),
    fee_amount NUMERIC(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255)
);

-- Table: messages
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    CONSTRAINT fk_message_recipient FOREIGN KEY (recipient_id) REFERENCES users(id)
);

-- Table: in_app_notifications
CREATE TABLE in_app_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: staff_audit_log
CREATE TABLE staff_audit_log (
    id BIGSERIAL PRIMARY KEY,
    staff_id BIGINT,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    performed_by VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_staff FOREIGN KEY (staff_id) REFERENCES school_staff(id)
);

-- ============================================================================
-- SECTION 3: CREATE INDEXES
-- ============================================================================

-- Indexes for school_staff
CREATE INDEX idx_school_staff_staff_id ON school_staff(staff_id);
CREATE INDEX idx_school_staff_email ON school_staff(email);
CREATE INDEX idx_school_staff_role_id ON school_staff(role_id);
CREATE INDEX idx_school_staff_user_id ON school_staff(user_id);

-- Indexes for students
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_grade_section ON students(grade, section);
CREATE INDEX idx_students_admission_id ON students(admission_id);

-- Indexes for attendance
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- Indexes for staff_attendance
CREATE INDEX idx_staff_attendance_staff_id ON staff_attendance(staff_id);
CREATE INDEX idx_staff_attendance_date ON staff_attendance(attendance_date);

-- Indexes for timetable_slots
CREATE INDEX idx_tslot_class_section ON timetable_slots(class_id, section_id);
CREATE INDEX idx_tslot_teacher ON timetable_slots(teacher_details_id);
CREATE INDEX idx_tslot_day_period ON timetable_slots(day_of_week, period_no);

-- Unique index to prevent teacher double-booking
CREATE UNIQUE INDEX ux_tslot_teacher_timeslot 
    ON timetable_slots(day_of_week, period_no, teacher_details_id)
    WHERE teacher_details_id IS NOT NULL;

-- Indexes for courses
CREATE INDEX idx_courses_course_code ON courses(course_code);
CREATE INDEX idx_courses_category ON courses(category);

-- ============================================================================
-- SECTION 4: CREATE TRIGGERS
-- ============================================================================

-- Trigger function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to school_staff
CREATE TRIGGER update_school_staff_updated_at
    BEFORE UPDATE ON school_staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to students
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 5: INSERT SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1: Roles
-- ----------------------------------------------------------------------------
INSERT INTO roles (id, name, description) VALUES
    (1, 'ADMIN', 'Administrator role'),
    (2, 'TEACHER', 'Teacher role'),
    (3, 'STUDENT', 'Student role'),
    (4, 'PARENT', 'Parent role')
ON CONFLICT (id) DO NOTHING;

-- Also insert alternative naming convention
INSERT INTO roles (name, description) VALUES
    ('ROLE_ADMIN', 'Administrator role (alternative naming)'),
    ('ROLE_USER', 'Standard user role')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5.2: Admin Users
-- ----------------------------------------------------------------------------

-- User 1: admin (Password: ChangeMe_Initial1!)
INSERT INTO users (id, username, password_hash, email, full_name, enabled, account_non_expired, account_non_locked, credentials_non_expired)
VALUES (
    1,
    'admin',
    '$2a$10$Dow1b0CQpZK0s8AjtKq6uO2dQ.wc2u/.1ytY1/6YrXOvNhbbX6n1K',
    'admin@schoolms.com',
    'System Administrator',
    TRUE,
    TRUE,
    TRUE,
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- User 2: admin1 (Password: qwerty)
INSERT INTO users (username, password_hash, email, full_name, enabled, account_non_expired, account_non_locked, credentials_non_expired, created_at, updated_at)
SELECT 
    'admin1',
    '$2a$10$1bYp1SiyNLKn.z2QL8Iceu8Yw2GxWfZpXeQJcDjuCwaBlDg9uVkie',
    'admin1@schoolms.com',
    'Secondary Administrator',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin1');

-- ----------------------------------------------------------------------------
-- 5.3: User-Role Mappings
-- ----------------------------------------------------------------------------

-- Map admin to ADMIN role
INSERT INTO user_roles (user_id, role_id)
SELECT 1, r.id FROM roles r WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- Map admin1 to ADMIN role (try both naming conventions)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name IN ('ADMIN', 'ROLE_ADMIN')
WHERE u.username = 'admin1'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5.4: Grade Levels (Grades 1-12)
-- ----------------------------------------------------------------------------
INSERT INTO grade_levels (grade_number, name, description) VALUES
    (1, 'Grade 1', 'First grade - Elementary level'),
    (2, 'Grade 2', 'Second grade - Elementary level'),
    (3, 'Grade 3', 'Third grade - Elementary level'),
    (4, 'Grade 4', 'Fourth grade - Elementary level'),
    (5, 'Grade 5', 'Fifth grade - Elementary level'),
    (6, 'Grade 6', 'Sixth grade - Middle school level'),
    (7, 'Grade 7', 'Seventh grade - Middle school level'),
    (8, 'Grade 8', 'Eighth grade - Middle school level'),
    (9, 'Grade 9', 'Ninth grade - High school level'),
    (10, 'Grade 10', 'Tenth grade - High school level'),
    (11, 'Grade 11', 'Eleventh grade - High school level'),
    (12, 'Grade 12', 'Twelfth grade - High school level')
ON CONFLICT (grade_number) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- ----------------------------------------------------------------------------
-- 5.5: Sections (A-Z)
-- ----------------------------------------------------------------------------

INSERT INTO sections (section_name, description) VALUES
    ('A', 'Section A'),
    ('B', 'Section B'),
    ('C', 'Section C'),
    ('D', 'Section D'),
    ('E', 'Section E'),
    ('F', 'Section F'),
    ('G', 'Section G'),
    ('H', 'Section H'),
    ('I', 'Section I'),
    ('J', 'Section J'),
    ('K', 'Section K'),
    ('L', 'Section L'),
    ('M', 'Section M'),
    ('N', 'Section N'),
    ('O', 'Section O'),
    ('P', 'Section P'),
    ('Q', 'Section Q'),
    ('R', 'Section R'),
    ('S', 'Section S'),
    ('T', 'Section T'),
    ('U', 'Section U'),
    ('V', 'Section V'),
    ('W', 'Section W'),
    ('X', 'Section X'),
    ('Y', 'Section Y'),
    ('Z', 'Section Z')
ON CONFLICT (section_name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- ----------------------------------------------------------------------------
-- 5.6: Class Sections (Grades 1-12 × Sections A-D for 2025-2026)
-- ----------------------------------------------------------------------------
INSERT INTO class_sections (grade_id, section_id, room_number, academic_year)
SELECT 
    g.id, 
    s.id, 
    CONCAT(g.grade_number, s.section_name), 
    '2025-2026'
FROM grade_levels g
JOIN sections s ON s.section_name IN ('A', 'B', 'C', 'D')
ON CONFLICT (grade_id, section_id, academic_year) DO UPDATE SET
    room_number = EXCLUDED.room_number,
    updated_at = CURRENT_TIMESTAMP;

-- ----------------------------------------------------------------------------
-- 5.7: Staff Roles
-- ----------------------------------------------------------------------------

INSERT INTO staff_roles (name, description, is_active) VALUES
    ('Teacher', 'Teaching staff member', TRUE),
    ('Principal', 'School principal', TRUE),
    ('Admin', 'Administrative staff', TRUE),
    ('Librarian', 'Library management', TRUE),
    ('Management', 'School management', TRUE),
    ('Account Officer', 'Finance department', TRUE)
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5.8: Sample Courses
-- ----------------------------------------------------------------------------

INSERT INTO courses (name, category, description, is_active, created_at, updated_at)
SELECT 
    'Mathematics 101',
    'Mathematics',
    'Basic mathematics course for elementary students',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Mathematics 101');

INSERT INTO courses (name, category, description, is_active, created_at, updated_at)
SELECT 
    'English Literature',
    'Arts',
    'Introduction to English literature and composition',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE name = 'English Literature');

-- ============================================================================
-- SECTION 6: VERIFICATION QUERIES
-- ============================================================================

-- Display summary of created objects
DO $$
DECLARE
    table_count INTEGER;
    role_count INTEGER;
    user_count INTEGER;
    grade_count INTEGER;
    section_count INTEGER;
    class_section_count INTEGER;
    staff_role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    SELECT COUNT(*) INTO role_count FROM roles;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO grade_count FROM grade_levels;
    SELECT COUNT(*) INTO section_count FROM sections;
    SELECT COUNT(*) INTO class_section_count FROM class_sections;
    SELECT COUNT(*) INTO staff_role_count FROM staff_roles;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE CREATION SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Tables Created: %', table_count;
    RAISE NOTICE 'Roles: %', role_count;
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Grade Levels: %', grade_count;
    RAISE NOTICE 'Sections: %', section_count;
    RAISE NOTICE 'Class Sections: %', class_section_count;
    RAISE NOTICE 'Staff Roles: %', staff_role_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
