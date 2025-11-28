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

-- =====================================================================
-- Additional entity tables (extended coverage)
-- =====================================================================

-- Holidays (Auditable)
CREATE TABLE IF NOT EXISTS school_holidays (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    modified_by VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS ix_school_holidays_date ON school_holidays(date);

-- Legacy HRM designation + mapping + role tables (deprecated but still mapped)
CREATE TABLE IF NOT EXISTS hrm_staff_designations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    is_active BOOLEAN
);
CREATE TABLE IF NOT EXISTS hrm_staff_roles (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(255),
    description TEXT,
    is_active BOOLEAN
);
CREATE TABLE IF NOT EXISTS hrm_staff_designation_mappings (
    id BIGSERIAL PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    designation_id BIGINT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_date DATE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_hrm_staff_desig_map_staff ON hrm_staff_designation_mappings(staff_id);
ALTER TABLE hrm_staff_designation_mappings
    ADD CONSTRAINT IF NOT EXISTS fk_hrm_staff_desig_map_staff FOREIGN KEY (staff_id) REFERENCES school_staff(id);
ALTER TABLE hrm_staff_designation_mappings
    ADD CONSTRAINT IF NOT EXISTS fk_hrm_staff_desig_map_designation FOREIGN KEY (designation_id) REFERENCES hrm_staff_designations(id);

-- Teachers (legacy separate teacher table)
CREATE TABLE IF NOT EXISTS teachers (
    id BIGSERIAL PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    department VARCHAR(255),
    specialization VARCHAR(255),
    subjects TEXT,
    teaching_experience INTEGER,
    is_class_teacher BOOLEAN DEFAULT FALSE,
    class_assigned_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
ALTER TABLE teachers
    ADD CONSTRAINT IF NOT EXISTS fk_teachers_staff FOREIGN KEY (staff_id) REFERENCES school_staff(id);

-- School settings (singleton row expected)
CREATE TABLE IF NOT EXISTS school_settings (
    id BIGINT PRIMARY KEY,
    school_name VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url VARCHAR(255),
    receipt_prefix VARCHAR(50),
    updated_at TIMESTAMP
);

-- Timetable settings / slots
CREATE TABLE IF NOT EXISTS timetable_settings (
    id BIGSERIAL PRIMARY KEY,
    working_days_mask INTEGER,
    periods_per_day INTEGER,
    period_duration_min INTEGER,
    lunch_after_period INTEGER,
    max_periods_per_teacher_per_day INTEGER,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timetable_slots (
    id BIGSERIAL PRIMARY KEY,
    version BIGINT,
    class_id BIGINT NOT NULL,
    section_id BIGINT NOT NULL,
    day_of_week INTEGER NOT NULL,
    period_no INTEGER NOT NULL,
    subject_id BIGINT,
    teacher_details_id BIGINT,
    locked BOOLEAN DEFAULT FALSE,
    generated_by VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(class_id, section_id, day_of_week, period_no)
);
ALTER TABLE timetable_slots
    ADD CONSTRAINT IF NOT EXISTS fk_timetable_slots_subject FOREIGN KEY (subject_id) REFERENCES subjects(id);
ALTER TABLE timetable_slots
    ADD CONSTRAINT IF NOT EXISTS fk_timetable_slots_teacher_details FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id);
ALTER TABLE timetable_slots
    ADD CONSTRAINT IF NOT EXISTS fk_timetable_slots_class FOREIGN KEY (class_id) REFERENCES classes(id);

-- Teacher class mapping
CREATE TABLE IF NOT EXISTS teacher_class_map (
    id BIGSERIAL PRIMARY KEY,
    teacher_details_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    section VARCHAR(5) NOT NULL,
    academic_year VARCHAR(9),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(teacher_details_id, class_id, section)
);
ALTER TABLE teacher_class_map
    ADD CONSTRAINT IF NOT EXISTS fk_teacher_class_map_teacher_details FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id);
ALTER TABLE teacher_class_map
    ADD CONSTRAINT IF NOT EXISTS fk_teacher_class_map_class FOREIGN KEY (class_id) REFERENCES classes(id);

-- Teacher subject mapping
CREATE TABLE IF NOT EXISTS teacher_subject_map (
    id BIGSERIAL PRIMARY KEY,
    teacher_details_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
ALTER TABLE teacher_subject_map
    ADD CONSTRAINT IF NOT EXISTS fk_teacher_subject_map_teacher_details FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id);
ALTER TABLE teacher_subject_map
    ADD CONSTRAINT IF NOT EXISTS fk_teacher_subject_map_subject FOREIGN KEY (subject_id) REFERENCES subjects(id);

-- Exam blueprint units and questions
CREATE TABLE IF NOT EXISTS blueprint_units (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    marks INTEGER NOT NULL,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL
);
ALTER TABLE blueprint_units
    ADD CONSTRAINT IF NOT EXISTS fk_blueprint_units_class FOREIGN KEY (class_id) REFERENCES classes(id);
ALTER TABLE blueprint_units
    ADD CONSTRAINT IF NOT EXISTS fk_blueprint_units_subject FOREIGN KEY (subject_id) REFERENCES subjects(id);
ALTER TABLE blueprint_units
    ADD CONSTRAINT IF NOT EXISTS fk_blueprint_units_exam FOREIGN KEY (exam_id) REFERENCES exams(id);

CREATE TABLE IF NOT EXISTS blueprint_unit_questions (
    id BIGSERIAL PRIMARY KEY,
    count INTEGER NOT NULL,
    marks_per_question INTEGER NOT NULL,
    unit_id BIGINT
);
ALTER TABLE blueprint_unit_questions
    ADD CONSTRAINT IF NOT EXISTS fk_blueprint_unit_questions_unit FOREIGN KEY (unit_id) REFERENCES blueprint_units(id);

-- Exam configs
CREATE TABLE IF NOT EXISTS exam_configs (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    max_marks INTEGER,
    theory_marks INTEGER,
    practical_marks INTEGER
);
ALTER TABLE exam_configs
    ADD CONSTRAINT IF NOT EXISTS fk_exam_configs_class FOREIGN KEY (class_id) REFERENCES classes(id);
ALTER TABLE exam_configs
    ADD CONSTRAINT IF NOT EXISTS fk_exam_configs_subject FOREIGN KEY (subject_id) REFERENCES subjects(id);

-- Exam mark summaries
CREATE TABLE IF NOT EXISTS exam_mark_summaries (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    class_id BIGINT,
    subject_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    is_absent BOOLEAN DEFAULT FALSE,
    absence_reason TEXT,
    total_theory_marks DOUBLE PRECISION,
    total_practical_marks DOUBLE PRECISION,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(exam_id, subject_id, student_id)
);
ALTER TABLE exam_mark_summaries
    ADD CONSTRAINT IF NOT EXISTS fk_exam_mark_summaries_exam FOREIGN KEY (exam_id) REFERENCES exams(id);
ALTER TABLE exam_mark_summaries
    ADD CONSTRAINT IF NOT EXISTS fk_exam_mark_summaries_subject FOREIGN KEY (subject_id) REFERENCES subjects(id);
ALTER TABLE exam_mark_summaries
    ADD CONSTRAINT IF NOT EXISTS fk_exam_mark_summaries_student FOREIGN KEY (student_id) REFERENCES students(id);

-- Exam mark details
CREATE TABLE IF NOT EXISTS exam_mark_details (
    id BIGSERIAL PRIMARY KEY,
    summary_id BIGINT NOT NULL,
    question_format_id BIGINT NOT NULL,
    question_number INTEGER NOT NULL,
    unit_name VARCHAR(255),
    question_type VARCHAR(50),
    max_marks DOUBLE PRECISION NOT NULL,
    obtained_marks DOUBLE PRECISION,
    evaluator_comments TEXT,
    last_edit_reason TEXT,
    last_edit_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(summary_id, question_format_id)
);
ALTER TABLE exam_mark_details
    ADD CONSTRAINT IF NOT EXISTS fk_exam_mark_details_summary FOREIGN KEY (summary_id) REFERENCES exam_mark_summaries(id);

-- Messaging
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender_id BIGINT NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    send_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
ALTER TABLE messages
    ADD CONSTRAINT IF NOT EXISTS fk_messages_sender FOREIGN KEY (sender_id) REFERENCES employees(id);

CREATE TABLE IF NOT EXISTS message_recipients (
    message_id BIGINT NOT NULL,
    recipients VARCHAR(255) NOT NULL
);
ALTER TABLE message_recipients
    ADD CONSTRAINT IF NOT EXISTS fk_message_recipients_message FOREIGN KEY (message_id) REFERENCES messages(id);

CREATE TABLE IF NOT EXISTS message_read_status (
    message_id BIGINT NOT NULL,
    read_by VARCHAR(255) NOT NULL
);
ALTER TABLE message_read_status
    ADD CONSTRAINT IF NOT EXISTS fk_message_read_status_message FOREIGN KEY (message_id) REFERENCES messages(id);

CREATE TABLE IF NOT EXISTS in_app_notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'UNREAD',
    created_at TIMESTAMP,
    read_at TIMESTAMP
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(255),
    email VARCHAR(255),
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS ix_employees_email ON employees(email);

-- Fee & Finance tables
CREATE TABLE IF NOT EXISTS fee_structures (
    id BIGSERIAL PRIMARY KEY,
    class_grade INTEGER UNIQUE NOT NULL,
    annual_fees NUMERIC(12,2) NOT NULL,
    building_fees NUMERIC(12,2) NOT NULL,
    lab_fees NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    modified_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS payment_schedules (
    id BIGSERIAL PRIMARY KEY,
    fee_structure_id BIGINT NOT NULL,
    schedule_type VARCHAR(50) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
ALTER TABLE payment_schedules
    ADD CONSTRAINT IF NOT EXISTS fk_payment_schedules_fee_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id);

CREATE TABLE IF NOT EXISTS late_fees (
    id BIGSERIAL PRIMARY KEY,
    fee_structure_id BIGINT NOT NULL,
    month_value INTEGER NOT NULL,
    late_fee_amount NUMERIC(12,2) NOT NULL,
    late_fee_description TEXT,
    fine_amount NUMERIC(12,2) NOT NULL,
    fine_description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
ALTER TABLE late_fees
    ADD CONSTRAINT IF NOT EXISTS fk_late_fees_fee_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id);

CREATE TABLE IF NOT EXISTS fee_payment_schedules (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    payment_frequency VARCHAR(50) NOT NULL,
    effective_from DATE NOT NULL,
    effective_until DATE,
    academic_year INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL,
    frequency_change_count INTEGER NOT NULL,
    change_reason TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
ALTER TABLE fee_payment_schedules
    ADD CONSTRAINT IF NOT EXISTS fk_fee_payment_schedules_student FOREIGN KEY (student_id) REFERENCES students(id);

CREATE TABLE IF NOT EXISTS fees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    grade INTEGER NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    due_date DATE NOT NULL,
    fee_type VARCHAR(50) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    fee_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_reference VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    remarks TEXT,
    payer_name VARCHAR(255),
    payer_contact_info VARCHAR(255),
    payer_relation_to_student VARCHAR(100),
    receipt_number VARCHAR(100),
    void_reason TEXT,
    voided_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
ALTER TABLE payments
    ADD CONSTRAINT IF NOT EXISTS fk_payments_fee FOREIGN KEY (fee_id) REFERENCES fees(id);
ALTER TABLE payments
    ADD CONSTRAINT IF NOT EXISTS fk_payments_student FOREIGN KEY (student_id) REFERENCES students(id);

CREATE TABLE IF NOT EXISTS transport_routes (
    id BIGSERIAL PRIMARY KEY,
    route_name VARCHAR(255) UNIQUE NOT NULL,
    route_description TEXT,
    fee_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_fee_assignments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    fee_structure_id BIGINT NOT NULL,
    payment_schedule_id BIGINT NOT NULL,
    transport_route_id BIGINT,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
ALTER TABLE student_fee_assignments
    ADD CONSTRAINT IF NOT EXISTS fk_student_fee_assignments_student FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE student_fee_assignments
    ADD CONSTRAINT IF NOT EXISTS fk_student_fee_assignments_fee_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id);
ALTER TABLE student_fee_assignments
    ADD CONSTRAINT IF NOT EXISTS fk_student_fee_assignments_payment_schedule FOREIGN KEY (payment_schedule_id) REFERENCES payment_schedules(id);
ALTER TABLE student_fee_assignments
    ADD CONSTRAINT IF NOT EXISTS fk_student_fee_assignments_transport_route FOREIGN KEY (transport_route_id) REFERENCES transport_routes(id);

CREATE TABLE IF NOT EXISTS fee_payments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    fee_structure_id BIGINT NOT NULL,
    payment_schedule_id BIGINT NOT NULL,
    amount_paid NUMERIC(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    transaction_reference VARCHAR(255),
    remarks TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
ALTER TABLE fee_payments
    ADD CONSTRAINT IF NOT EXISTS fk_fee_payments_student FOREIGN KEY (student_id) REFERENCES students(id);
ALTER TABLE fee_payments
    ADD CONSTRAINT IF NOT EXISTS fk_fee_payments_fee_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id);
ALTER TABLE fee_payments
    ADD CONSTRAINT IF NOT EXISTS fk_fee_payments_payment_schedule FOREIGN KEY (payment_schedule_id) REFERENCES payment_schedules(id);

-- Ensure staff foreign keys for role & teacher_details (added earlier) + optional exam joins
-- fk_school_staff_role handled in schema_final.sql via idempotent helper; remove here to avoid IF NOT EXISTS syntax on older PostgreSQL
-- ALTER TABLE school_staff ADD CONSTRAINT fk_school_staff_role FOREIGN KEY (role_id) REFERENCES staff_roles(id);

-- =====================================================================
-- End of extended entity coverage
-- =====================================================================
