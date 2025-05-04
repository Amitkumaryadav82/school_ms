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