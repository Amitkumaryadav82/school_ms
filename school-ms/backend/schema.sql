-- DDL Queries for Student Service
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    date_of_birth DATE NOT NULL,
    grade INTEGER NOT NULL,
    section VARCHAR(10) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    address TEXT,
    gender VARCHAR(10),
    guardian_name VARCHAR(100) NOT NULL,
    guardian_contact VARCHAR(20) NOT NULL,
    guardian_email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    admission_date DATE NOT NULL,
    photo_url VARCHAR(255),
    blood_group VARCHAR(10),
    medical_conditions TEXT,
    admission_id BIGINT UNIQUE REFERENCES admissions(id),
    guardian_occupation VARCHAR(100),
    guardian_office_address TEXT,
    aadhar_number VARCHAR(20),
    udise_number VARCHAR(20),
    house_alloted VARCHAR(50),
    guardian_annual_income DECIMAL(15,2),
    previous_school VARCHAR(100),
    tc_number VARCHAR(50),
    tc_reason TEXT,
    tc_date DATE,
    whatsapp_number VARCHAR(20),
    subjects TEXT,
    transport_mode VARCHAR(10),
    bus_route_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    modified_by VARCHAR(100)
);

-- DDL Queries for Admission Service
CREATE TABLE admissions (
    id SERIAL PRIMARY KEY,
    application_date DATE NOT NULL,
    applicant_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    guardian_name VARCHAR(100) NOT NULL,
    guardian_contact VARCHAR(20) NOT NULL,
    guardian_email VARCHAR(100),
    grade_applying INTEGER NOT NULL,
    previous_school VARCHAR(100),
    previous_grade VARCHAR(20),
    previous_percentage DECIMAL(5,2),
    documents BYTEA,
    documents_format VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    modified_by VARCHAR(100)
);

-- DDL Queries for Attendance Service
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL
);

-- DDL Queries for Communication Service
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_date DATE NOT NULL
);

-- DDL Queries for Exam Service
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    total_marks INT NOT NULL
);

-- DDL Queries for Fee Service
CREATE TABLE fees (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL
);

-- DDL Queries for HRM Service
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL
);

-- DDL Queries for Timetable Service
CREATE TABLE timetable (
    id SERIAL PRIMARY KEY,
    class VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher_id INT NOT NULL,
    schedule TIMESTAMP NOT NULL
);

-- DML Queries for Admission Service
INSERT INTO admissions (id, student_id, admission_date, status) VALUES (1, 101, '2025-04-01', 'approved');

-- DML Queries for Attendance Service
INSERT INTO attendance (id, student_id, date, status) VALUES (1, 101, '2025-04-26', 'present');

-- DML Queries for Communication Service
INSERT INTO messages (id, sender_id, receiver_id, content, sent_date) VALUES (1, 201, 301, 'Welcome to the school!', '2025-04-01');

-- DML Queries for Exam Service
INSERT INTO exams (id, subject, date, total_marks) VALUES (1, 'Mathematics', '2025-05-01', 100);

-- DML Queries for Fee Service
INSERT INTO fees (id, student_id, amount, due_date, status) VALUES (1, 101, 5000, '2025-05-10', 'unpaid');

-- DML Queries for HRM Service
INSERT INTO employees (id, name, role, hire_date) VALUES (1, 'John Doe', 'Teacher', '2025-03-15');

-- DML Queries for Student Service
INSERT INTO students (id, name, grade, enrollment_date) VALUES (101, 'Jane Smith', 'Grade 10', '2025-04-01');

-- DML Queries for Timetable Service
INSERT INTO timetable (id, class, subject, teacher_id, schedule) VALUES (1, 'Grade 10', 'Mathematics', 1, '2025-04-28 10:00:00');

-- Transport Management Tables
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    driver_name VARCHAR(100),
    driver_license VARCHAR(50),
    driver_contact VARCHAR(20),
    insurance_expiry DATE,
    last_maintenance_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_name VARCHAR(100) NOT NULL,
    route_description TEXT,
    start_location VARCHAR(200) NOT NULL,
    end_location VARCHAR(200) NOT NULL,
    total_stops INT,
    distance DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS route_stops (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_id BIGINT,
    stop_name VARCHAR(100) NOT NULL,
    stop_order INT NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    FOREIGN KEY (route_id) REFERENCES routes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transport_assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id BIGINT,
    route_id BIGINT,
    driver_id BIGINT,
    active BOOLEAN DEFAULT true,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_transport (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT,
    route_id BIGINT,
    stop_id BIGINT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (stop_id) REFERENCES route_stops(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transport_fees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_id BIGINT,
    fee_amount DECIMAL(10,2) NOT NULL,
    fee_period VARCHAR(20),
    effective_from DATE,
    effective_to DATE,
    FOREIGN KEY (route_id) REFERENCES routes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff Management Tables

-- Staff Role Types
CREATE TABLE IF NOT EXISTS staff_roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Table (Base table for all staff members)
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    join_date DATE NOT NULL,
    role_id INT NOT NULL REFERENCES staff_roles(id),
    user_id INT REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    qualifications TEXT,
    emergency_contact VARCHAR(100),
    blood_group VARCHAR(5),
    profile_image VARCHAR(255),
    pf_uan VARCHAR(50),              -- PF UAN (alphanumeric)
    gratuity VARCHAR(50),            -- Gratuity (alphanumeric)
    service_end_date DATE,           -- Service End Date (optional)
    basic_salary DECIMAL(12,2),      -- Basic salary amount
    hra DECIMAL(12,2),               -- House Rent Allowance
    da DECIMAL(12,2),                -- Dearness Allowance
    ta DECIMAL(12,2),                -- Travel Allowance
    other_allowances DECIMAL(12,2),  -- Other allowances
    pf_contribution DECIMAL(12,2),   -- PF contribution
    tax_deduction DECIMAL(12,2),     -- Tax deduction
    net_salary DECIMAL(12,2),        -- Net salary after all deductions
    salary_account_number VARCHAR(50), -- Bank account number for salary
    bank_name VARCHAR(100),          -- Bank name
    ifsc_code VARCHAR(20),           -- IFSC code for bank transfers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher-specific information
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    department VARCHAR(100),
    specialization VARCHAR(100),
    subjects TEXT,
    teaching_experience INT,
    is_class_teacher BOOLEAN DEFAULT FALSE,
    class_assigned_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Special Designations for Staff
CREATE TABLE IF NOT EXISTS staff_designations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-Many relationship between Staff and Designations
CREATE TABLE IF NOT EXISTS staff_designation_mappings (
    id SERIAL PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    designation_id INT NOT NULL REFERENCES staff_designations(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, designation_id)
);

-- Insert default staff roles
INSERT INTO staff_roles (role_name, description)
VALUES 
    ('Principal', 'School head responsible for overall management'),
    ('Admin Officer', 'Handles administrative tasks'),
    ('Management', 'Responsible for school operations and management'),
    ('Account Officer', 'Manages school finances and accounts'),
    ('Librarian', 'Manages library resources'),
    ('Teacher', 'Responsible for teaching and student development')
ON CONFLICT (role_name) DO NOTHING;

-- Insert default staff designations
INSERT INTO staff_designations (name, description)
VALUES 
    ('Timetable Incharge', 'Teacher responsible for creating and managing school timetables'),
    ('Exam Cell Member', 'Teacher who is part of examination management team')
ON CONFLICT (name) DO NOTHING;

-- Course Management Tables
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    teacher_id BIGINT,
    credits INT NOT NULL DEFAULT 3,
    capacity INT NOT NULL DEFAULT 30,
    enrolled INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student-Course Enrollment table for many-to-many relationship
CREATE TABLE enrollments (
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, course_id)
);

-- Insert some sample courses
INSERT INTO courses (name, department, teacher_id, credits, capacity, enrolled)
VALUES 
    ('Mathematics 101', 'Mathematics', 1, 4, 30, 0),
    ('English Literature', 'Languages', 2, 3, 25, 0),
    ('Computer Science Basics', 'Computer Science', 3, 4, 20, 0),
    ('Physics Fundamentals', 'Science', 4, 4, 30, 0),
    ('World History', 'Social Studies', 5, 3, 35, 0);

-- Fee Management Tables

-- Fee Structure table - defines fee structure for a class
CREATE TABLE IF NOT EXISTS fee_structures (
    id SERIAL PRIMARY KEY,
    class_grade INT NOT NULL,
    annual_fees DECIMAL(12,2) NOT NULL,
    building_fees DECIMAL(12,2) NOT NULL DEFAULT 0,
    lab_fees DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    modified_by VARCHAR(100),
    UNIQUE(class_grade)
);

-- Payment Schedule Options table - defines available payment schedules for each class
CREATE TABLE IF NOT EXISTS payment_schedules (
    id SERIAL PRIMARY KEY,
    fee_structure_id BIGINT NOT NULL,
    schedule_type VARCHAR(20) NOT NULL, -- 'MONTHLY', 'QUARTERLY', 'YEARLY'
    amount DECIMAL(12,2) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE,
    UNIQUE(fee_structure_id, schedule_type)
);

-- Late Fees and Fines table - defines late fees for each month if applicable
CREATE TABLE IF NOT EXISTS late_fees (
    id SERIAL PRIMARY KEY,
    fee_structure_id BIGINT NOT NULL,
    month INT NOT NULL, -- 1-12 for Jan-Dec
    late_fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    late_fee_description TEXT,
    fine_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    fine_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE,
    UNIQUE(fee_structure_id, month)
);

-- Transport Routes table with fees
CREATE TABLE IF NOT EXISTS transport_routes (
    id SERIAL PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    route_description TEXT,
    fee_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(route_name)
);

-- Student Fee Assignments - links students to their fee structures and payment options
CREATE TABLE IF NOT EXISTS student_fee_assignments (
    id SERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    fee_structure_id BIGINT NOT NULL,
    payment_schedule_id BIGINT NOT NULL,
    transport_route_id BIGINT,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id),
    FOREIGN KEY (payment_schedule_id) REFERENCES payment_schedules(id),
    FOREIGN KEY (transport_route_id) REFERENCES transport_routes(id)
);

-- Fee Payments - records actual payments made by students
CREATE TABLE IF NOT EXISTS fee_payments (
    id SERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    fee_structure_id BIGINT NOT NULL,
    payment_schedule_id BIGINT NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    transaction_reference VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id),
    FOREIGN KEY (payment_schedule_id) REFERENCES payment_schedules(id)
);

-- Insert some sample data for fee structures
INSERT INTO fee_structures (class_grade, annual_fees, building_fees, lab_fees)
VALUES 
    (1, 50000.00, 5000.00, 0.00),
    (2, 55000.00, 5000.00, 0.00),
    (3, 60000.00, 5000.00, 0.00),
    (4, 65000.00, 5000.00, 0.00),
    (5, 70000.00, 5000.00, 2000.00),
    (6, 75000.00, 5000.00, 2000.00),
    (7, 80000.00, 5000.00, 3000.00),
    (8, 85000.00, 5000.00, 3000.00),
    (9, 90000.00, 5000.00, 5000.00),
    (10, 95000.00, 5000.00, 5000.00),
    (11, 100000.00, 5000.00, 8000.00),
    (12, 100000.00, 5000.00, 8000.00);

-- Insert sample payment schedules for class 1
INSERT INTO payment_schedules (fee_structure_id, schedule_type, amount, is_enabled)
VALUES 
    (1, 'MONTHLY', 4583.33, TRUE),
    (1, 'QUARTERLY', 13750.00, TRUE),
    (1, 'YEARLY', 50000.00, TRUE);

-- Insert sample transport routes
INSERT INTO transport_routes (route_name, route_description, fee_amount)
VALUES 
    ('Route A', 'City Center to School', 5000.00),
    ('Route B', 'North Suburb to School', 6000.00),
    ('Route C', 'East Suburb to School', 7000.00),
    ('Route D', 'South Suburb to School', 6500.00),
    ('Route E', 'West Suburb to School', 6000.00);

-- Insert sample late fees for class 1
INSERT INTO late_fees (fee_structure_id, month, late_fee_amount, late_fee_description, fine_amount, fine_description)
VALUES
    (1, 7, 500.00, 'Late payment fee for July', 200.00, 'Additional fine for delayed payment after July 15th'),
    (1, 10, 500.00, 'Late payment fee for October', 200.00, 'Additional fine for delayed payment after October 15th'),
    (1, 1, 500.00, 'Late payment fee for January', 200.00, 'Additional fine for delayed payment after January 15th');