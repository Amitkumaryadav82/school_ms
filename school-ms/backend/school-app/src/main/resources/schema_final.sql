-- FINAL CONSOLIDATED SCHEMA (authoritative)
-- This file aggregates all JPA-mapped tables post-Flyway removal.
-- Apply with: psql -d <database> -f schema_final.sql
-- Safe to re-run (idempotent FKs + IF NOT EXISTS).

-- ================= CORE & STAFF =================
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

-- ================= COURSES =================
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

-- ================= ACADEMICS (CORE) =================
-- School classes used across timetable/exams
CREATE TABLE IF NOT EXISTS classes (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_classes_name ON classes(name);

-- Subjects used by exams/timetable; aligns with com.school.exam.model.Subject
CREATE TABLE IF NOT EXISTS subjects (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	code VARCHAR(50),
	description TEXT,
	max_marks INTEGER,
	theory_marks INTEGER,
	practical_marks INTEGER
);
-- Ensure fast lookups and avoid duplicates by code
CREATE UNIQUE INDEX IF NOT EXISTS uq_subjects_code ON subjects(code);

-- Grade levels and sections used for class/section APIs and timetable
CREATE TABLE IF NOT EXISTS grade_levels (
	id BIGSERIAL PRIMARY KEY,
	grade_number INT NOT NULL,
	name VARCHAR(50) NOT NULL,
	description VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT uq_grade_number UNIQUE (grade_number)
);

CREATE TABLE IF NOT EXISTS sections (
	id BIGSERIAL PRIMARY KEY,
	section_name VARCHAR(5) NOT NULL,
	description VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT uq_section_name UNIQUE (section_name)
);

CREATE TABLE IF NOT EXISTS class_sections (
	id BIGSERIAL PRIMARY KEY,
	grade_id BIGINT NOT NULL,
	section_id BIGINT NOT NULL,
	capacity INT DEFAULT 40,
	room_number VARCHAR(10),
	academic_year VARCHAR(9) DEFAULT '2025-2026',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT uq_grade_section_year UNIQUE (grade_id, section_id, academic_year)
);

-- ================= ADMISSIONS / STUDENTS =================
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

-- ================= HOLIDAYS =================
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

-- ================= LEGACY HRM (DEPRECATED) =================
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
-- Canonical staff roles table used by school_staff.role_id FK
CREATE TABLE IF NOT EXISTS staff_roles (
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

-- ================= SETTINGS =================
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

-- ================= TIMETABLE =================
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

CREATE TABLE IF NOT EXISTS teacher_subject_map (
	id BIGSERIAL PRIMARY KEY,
	teacher_details_id BIGINT NOT NULL,
	subject_id BIGINT NOT NULL,
	created_at TIMESTAMP,
	updated_at TIMESTAMP
);

-- ================= TIMETABLE (AUXILIARY) =================
-- Optional per-class/section overrides
CREATE TABLE IF NOT EXISTS timetable_class_settings (
	id BIGSERIAL PRIMARY KEY,
	class_id BIGINT NOT NULL,
	section_id BIGINT NOT NULL,
	periods_per_day INT,
	period_duration_min INT,
	lunch_after_period INT,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	CONSTRAINT uq_class_section UNIQUE (class_id, section_id)
);

-- Subject requirements per class/section
CREATE TABLE IF NOT EXISTS timetable_requirements (
	id BIGSERIAL PRIMARY KEY,
	class_id BIGINT NOT NULL,
	section_id BIGINT NOT NULL,
	subject_id BIGINT NOT NULL,
	preferred_teacher_details_id BIGINT,
	weekly_periods INT NOT NULL,
	notes VARCHAR(500),
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	CONSTRAINT uq_req UNIQUE (class_id, section_id, subject_id)
);

-- Dated substitutions overlay
CREATE TABLE IF NOT EXISTS timetable_substitutions (
	id BIGSERIAL PRIMARY KEY,
	date DATE NOT NULL,
	class_id BIGINT NOT NULL,
	section_id BIGINT NOT NULL,
	period_no INT NOT NULL,
	original_teacher_details_id BIGINT,
	substitute_teacher_details_id BIGINT,
	reason VARCHAR(20),
	approved_by VARCHAR(100),
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	CONSTRAINT uq_subst UNIQUE (date, class_id, section_id, period_no)
);

-- ================= EXAMS =================
-- Core exam master table used by exam configs and marks
CREATE TABLE IF NOT EXISTS exams (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(255),
	description TEXT,
	start_date DATE,
	end_date DATE
);

-- Many-to-many mapping between exams and classes
CREATE TABLE IF NOT EXISTS exam_classes (
	id BIGSERIAL PRIMARY KEY,
	exam_id BIGINT NOT NULL,
	class_id BIGINT NOT NULL,
	UNIQUE(exam_id, class_id)
);

CREATE TABLE IF NOT EXISTS blueprint_units (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	marks INTEGER NOT NULL,
	class_id BIGINT NOT NULL,
	subject_id BIGINT NOT NULL,
	exam_id BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS blueprint_unit_questions (
	id BIGSERIAL PRIMARY KEY,
	count INTEGER NOT NULL,
	marks_per_question INTEGER NOT NULL,
	unit_id BIGINT
);

CREATE TABLE IF NOT EXISTS exam_configs (
	id BIGSERIAL PRIMARY KEY,
	class_id BIGINT NOT NULL,
	subject_id BIGINT NOT NULL,
	max_marks INTEGER,
	theory_marks INTEGER,
	practical_marks INTEGER
);

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

-- ================= MESSAGING =================
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

-- ================= LIBRARY (JDBC REPOSITORIES) =================
CREATE TABLE IF NOT EXISTS books (
	id BIGSERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	author VARCHAR(255) NOT NULL,
	category VARCHAR(100),
	status VARCHAR(50) NOT NULL DEFAULT 'Available',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_issues (
	id BIGSERIAL PRIMARY KEY,
	book_id BIGINT NOT NULL,
	issued_to VARCHAR(255) NOT NULL,
	issue_type VARCHAR(50) NOT NULL,
	issuee_name VARCHAR(255),
	issue_date DATE NOT NULL,
	due_date DATE NOT NULL,
	return_date DATE,
	status VARCHAR(50) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= SECURITY USERS =================
-- USERS table (security) consolidated; includes auditing columns
CREATE TABLE IF NOT EXISTS users (
	id BIGSERIAL PRIMARY KEY,
	username VARCHAR(100) NOT NULL UNIQUE,
	full_name VARCHAR(150) NOT NULL,
	email VARCHAR(180) NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	role VARCHAR(40),
	enabled BOOLEAN DEFAULT TRUE,
	account_non_expired BOOLEAN DEFAULT TRUE,
	account_non_locked BOOLEAN DEFAULT TRUE,
	credentials_non_expired BOOLEAN DEFAULT TRUE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_by VARCHAR(100),
	modified_by VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Seed admin2 user with password 'qwerty' (adjust hashing per encoder)
INSERT INTO users (username, full_name, email, password_hash, role)
SELECT 'admin2', 'Administrator', 'admin2@example.com', 'qwerty', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin2');

CREATE TABLE IF NOT EXISTS message_recipients (
	message_id BIGINT NOT NULL,
	recipients VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS message_read_status (
	message_id BIGINT NOT NULL,
	read_by VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS in_app_notifications (
	id BIGSERIAL PRIMARY KEY,
	recipient VARCHAR(255) NOT NULL,
	subject VARCHAR(255) NOT NULL,
	content TEXT,
	status VARCHAR(50) DEFAULT 'UNREAD',
	created_at TIMESTAMP,
	read_at TIMESTAMP
);

-- ================= FEES =================
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

-- ================= FKs =================
-- PostgreSQL <15 does not support ADD CONSTRAINT IF NOT EXISTS; implement idempotent FK creation via helper function.
-- Helper: add FK NOT VALID to avoid failing when existing legacy data violates it;
-- we will validate constraints later after seeds/cleanup.
CREATE OR REPLACE FUNCTION add_fk_if_absent(p_table text, p_constraint text, p_def text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = p_constraint) THEN
		EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s NOT VALID', p_table, p_constraint, p_def);
    END IF;
END;$$;

SELECT add_fk_if_absent('school_staff','fk_school_staff_teacher_details','FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id)');
SELECT add_fk_if_absent('students','fk_students_admission','FOREIGN KEY (admission_id) REFERENCES admissions(id)');
SELECT add_fk_if_absent('hrm_staff_designation_mappings','fk_hrm_staff_desig_map_staff','FOREIGN KEY (staff_id) REFERENCES school_staff(id)');
SELECT add_fk_if_absent('hrm_staff_designation_mappings','fk_hrm_staff_desig_map_designation','FOREIGN KEY (designation_id) REFERENCES hrm_staff_designations(id)');
SELECT add_fk_if_absent('teachers','fk_teachers_staff','FOREIGN KEY (staff_id) REFERENCES school_staff(id)');
SELECT add_fk_if_absent('timetable_slots','fk_timetable_slots_subject','FOREIGN KEY (subject_id) REFERENCES subjects(id)');
SELECT add_fk_if_absent('timetable_slots','fk_timetable_slots_teacher_details','FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id)');
SELECT add_fk_if_absent('timetable_slots','fk_timetable_slots_class','FOREIGN KEY (class_id) REFERENCES classes(id)');
SELECT add_fk_if_absent('teacher_class_map','fk_teacher_class_map_teacher_details','FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id)');
SELECT add_fk_if_absent('teacher_class_map','fk_teacher_class_map_class','FOREIGN KEY (class_id) REFERENCES classes(id)');
SELECT add_fk_if_absent('teacher_subject_map','fk_teacher_subject_map_teacher_details','FOREIGN KEY (teacher_details_id) REFERENCES teacher_details(id)');
SELECT add_fk_if_absent('teacher_subject_map','fk_teacher_subject_map_subject','FOREIGN KEY (subject_id) REFERENCES subjects(id)');
SELECT add_fk_if_absent('blueprint_units','fk_blueprint_units_class','FOREIGN KEY (class_id) REFERENCES classes(id)');
SELECT add_fk_if_absent('blueprint_units','fk_blueprint_units_subject','FOREIGN KEY (subject_id) REFERENCES subjects(id)');
SELECT add_fk_if_absent('blueprint_units','fk_blueprint_units_exam','FOREIGN KEY (exam_id) REFERENCES exams(id)');
SELECT add_fk_if_absent('blueprint_unit_questions','fk_blueprint_unit_questions_unit','FOREIGN KEY (unit_id) REFERENCES blueprint_units(id)');
SELECT add_fk_if_absent('exam_configs','fk_exam_configs_class','FOREIGN KEY (class_id) REFERENCES classes(id)');
SELECT add_fk_if_absent('exam_configs','fk_exam_configs_subject','FOREIGN KEY (subject_id) REFERENCES subjects(id)');
SELECT add_fk_if_absent('exam_mark_summaries','fk_exam_mark_summaries_exam','FOREIGN KEY (exam_id) REFERENCES exams(id)');
SELECT add_fk_if_absent('exam_mark_summaries','fk_exam_mark_summaries_subject','FOREIGN KEY (subject_id) REFERENCES subjects(id)');
SELECT add_fk_if_absent('exam_mark_summaries','fk_exam_mark_summaries_student','FOREIGN KEY (student_id) REFERENCES students(id)');
SELECT add_fk_if_absent('exam_mark_details','fk_exam_mark_details_summary','FOREIGN KEY (summary_id) REFERENCES exam_mark_summaries(id)');
SELECT add_fk_if_absent('messages','fk_messages_sender','FOREIGN KEY (sender_id) REFERENCES employees(id)');
SELECT add_fk_if_absent('message_recipients','fk_message_recipients_message','FOREIGN KEY (message_id) REFERENCES messages(id)');
SELECT add_fk_if_absent('message_read_status','fk_message_read_status_message','FOREIGN KEY (message_id) REFERENCES messages(id)');
SELECT add_fk_if_absent('payment_schedules','fk_payment_schedules_fee_structure','FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id)');
SELECT add_fk_if_absent('late_fees','fk_late_fees_fee_structure','FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id)');
SELECT add_fk_if_absent('fee_payment_schedules','fk_fee_payment_schedules_student','FOREIGN KEY (student_id) REFERENCES students(id)');
SELECT add_fk_if_absent('payments','fk_payments_fee','FOREIGN KEY (fee_id) REFERENCES fees(id)');
SELECT add_fk_if_absent('payments','fk_payments_student','FOREIGN KEY (student_id) REFERENCES students(id)');
SELECT add_fk_if_absent('student_fee_assignments','fk_student_fee_assignments_student','FOREIGN KEY (student_id) REFERENCES students(id)');
SELECT add_fk_if_absent('student_fee_assignments','fk_student_fee_assignments_fee_structure','FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id)');
SELECT add_fk_if_absent('student_fee_assignments','fk_student_fee_assignments_payment_schedule','FOREIGN KEY (payment_schedule_id) REFERENCES payment_schedules(id)');
SELECT add_fk_if_absent('student_fee_assignments','fk_student_fee_assignments_transport_route','FOREIGN KEY (transport_route_id) REFERENCES transport_routes(id)');
SELECT add_fk_if_absent('fee_payments','fk_fee_payments_student','FOREIGN KEY (student_id) REFERENCES students(id)');
SELECT add_fk_if_absent('fee_payments','fk_fee_payments_fee_structure','FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id)');
SELECT add_fk_if_absent('fee_payments','fk_fee_payments_payment_schedule','FOREIGN KEY (payment_schedule_id) REFERENCES payment_schedules(id)');
SELECT add_fk_if_absent('school_staff','fk_school_staff_role','FOREIGN KEY (role_id) REFERENCES staff_roles(id)');
SELECT add_fk_if_absent('exam_classes','fk_exam_classes_exam','FOREIGN KEY (exam_id) REFERENCES exams(id)');
SELECT add_fk_if_absent('exam_classes','fk_exam_classes_class','FOREIGN KEY (class_id) REFERENCES classes(id)');
SELECT add_fk_if_absent('class_sections','fk_class_sections_grade','FOREIGN KEY (grade_id) REFERENCES grade_levels(id)');
SELECT add_fk_if_absent('class_sections','fk_class_sections_section','FOREIGN KEY (section_id) REFERENCES sections(id)');
SELECT add_fk_if_absent('timetable_class_settings','fk_tt_class_settings_class','FOREIGN KEY (class_id) REFERENCES classes(id)');
SELECT add_fk_if_absent('timetable_class_settings','fk_tt_class_settings_section','FOREIGN KEY (section_id) REFERENCES sections(id)');
SELECT add_fk_if_absent('timetable_requirements','fk_tt_requirements_class','FOREIGN KEY (class_id) REFERENCES classes(id)');
SELECT add_fk_if_absent('timetable_requirements','fk_tt_requirements_section','FOREIGN KEY (section_id) REFERENCES sections(id)');
SELECT add_fk_if_absent('timetable_requirements','fk_tt_requirements_subject','FOREIGN KEY (subject_id) REFERENCES subjects(id)');
SELECT add_fk_if_absent('timetable_requirements','fk_tt_requirements_pref_teacher','FOREIGN KEY (preferred_teacher_details_id) REFERENCES teacher_details(id)');
SELECT add_fk_if_absent('timetable_substitutions','fk_tt_subst_class','FOREIGN KEY (class_id) REFERENCES classes(id)');
SELECT add_fk_if_absent('timetable_substitutions','fk_tt_subst_section','FOREIGN KEY (section_id) REFERENCES sections(id)');
SELECT add_fk_if_absent('timetable_substitutions','fk_tt_subst_orig_teacher','FOREIGN KEY (original_teacher_details_id) REFERENCES teacher_details(id)');
SELECT add_fk_if_absent('timetable_substitutions','fk_tt_subst_sub_teacher','FOREIGN KEY (substitute_teacher_details_id) REFERENCES teacher_details(id)');
SELECT add_fk_if_absent('book_issues','fk_book_issues_book','FOREIGN KEY (book_id) REFERENCES books(id)');

-- After all seeds/cleanup, attempt to validate any NOT VALID constraints.
DO $$
DECLARE r RECORD;
BEGIN
	FOR r IN SELECT conname, conrelid::regclass AS tbl FROM pg_constraint WHERE convalidated = false AND contype='f'
	LOOP
		BEGIN
			EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I', r.tbl, r.conname);
		EXCEPTION WHEN others THEN
			-- Keep going; some constraints may still fail until manual data fixes.
			NULL;
		END;
	END LOOP;
END $$;

-- ================= SEED DATA =================
-- Seed staff roles
INSERT INTO staff_roles (role_name, description, is_active)
SELECT 'ADMIN','Administrator role', TRUE
WHERE NOT EXISTS (SELECT 1 FROM staff_roles WHERE role_name='ADMIN');
INSERT INTO staff_roles (role_name, description, is_active)
SELECT 'TEACHER','Teacher role', TRUE
WHERE NOT EXISTS (SELECT 1 FROM staff_roles WHERE role_name='TEACHER');
INSERT INTO staff_roles (role_name, description, is_active)
SELECT 'ACCOUNTANT','Accounts role', TRUE
WHERE NOT EXISTS (SELECT 1 FROM staff_roles WHERE role_name='ACCOUNTANT');

INSERT INTO courses (course_code, name, description, category)
SELECT 'MATH101','Mathematics','Basic math','ACADEMIC'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code='MATH101');
INSERT INTO courses (course_code, name, description, category)
SELECT 'ENG101','English','Basic English','ACADEMIC'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code='ENG101');

-- Seed Classes (Class 1..12) for exams/timetable
INSERT INTO classes (name)
SELECT v FROM (VALUES
 ('Class 1'),('Class 2'),('Class 3'),('Class 4'),('Class 5'),('Class 6'),
 ('Class 7'),('Class 8'),('Class 9'),('Class 10'),('Class 11'),('Class 12')
) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM classes);

-- Seed Subjects used broadly across the app
INSERT INTO subjects (name, code, description, max_marks, theory_marks, practical_marks)
SELECT * FROM (
	VALUES
	('Mathematics','MATH01','Core mathematics',100,100,0),
	('English Language','ENG01','English language skills',100,100,0),
	('Science','SCI01','General science',100,90,10),
	('Social Studies','SS01','History/Geography/Civics',100,100,0),
	('Hindi','HIN01','Hindi language',100,100,0),
	('Computer Science','CS01','Computers and programming',100,70,30),
	('Physics','PHY01','Physics theory and practical',100,70,30),
	('Chemistry','CHEM01','Chemistry theory and practical',100,70,30),
	('Biology','BIO01','Biology theory and practical',100,70,30),
	('Physical Education','PE01','Sports and physical education',100,0,100)
) AS s(name, code, description, max_marks, theory_marks, practical_marks)
WHERE NOT EXISTS (SELECT 1 FROM subjects);

-- Seed Grade Levels 1..12 (idempotent bulk when empty)
INSERT INTO grade_levels (grade_number, name, description)
SELECT g, CONCAT('Grade ', g), CASE 
	WHEN g BETWEEN 1 AND 5 THEN 'Elementary level'
	WHEN g BETWEEN 6 AND 8 THEN 'Middle school level'
	WHEN g BETWEEN 9 AND 12 THEN 'High school level' END
FROM generate_series(1,12) AS g
WHERE NOT EXISTS (SELECT 1 FROM grade_levels);

-- Seed Sections A-D when empty
INSERT INTO sections (section_name, description)
SELECT v, CONCAT('Section ', v)
FROM (VALUES ('A'),('B'),('C'),('D')) AS s(v)
WHERE NOT EXISTS (SELECT 1 FROM sections);

-- Create class_sections combinations for the current default year if none exist
INSERT INTO class_sections (grade_id, section_id, room_number, academic_year)
SELECT gl.id, s.id, CAST(gl.grade_number AS VARCHAR) || s.section_name, '2025-2026'
FROM grade_levels gl
CROSS JOIN sections s
WHERE NOT EXISTS (SELECT 1 FROM class_sections);

-- END OF FINAL CONSOLIDATED SCHEMA