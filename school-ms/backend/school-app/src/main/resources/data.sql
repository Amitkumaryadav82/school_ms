-- Test Data for School Management System
-- This file automatically loads sample data every time the application starts

-- ============================================================================
-- 1. USERS (Additional users beyond the auto-created admin)
-- ============================================================================
INSERT INTO users (created_at, updated_at, created_by, modified_by, account_non_expired, account_non_locked, credentials_non_expired, email, enabled, full_name, password, role, username) VALUES
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'system', 'system', true, true, true, 'teacher1@schoolms.com', true, 'Sarah Johnson', '$2a$10$Igjc9Jrznz/gzw4FkwoADeT4hOxwsm.yHaX./G0KH8qi.gVjzzm7G', 'TEACHER', 'teacher1'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'system', 'system', true, true, true, 'teacher2@schoolms.com', true, 'Michael Chen', '$2a$10$Igjc9Jrznz/gzw4FkwoADeT4hOxwsm.yHaX./G0KH8qi.gVjzzm7G', 'TEACHER', 'teacher2'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'system', 'system', true, true, true, 'principal@schoolms.com', true, 'Dr. Emily Rodriguez', '$2a$10$Igjc9Jrznz/gzw4FkwoADeT4hOxwsm.yHaX./G0KH8qi.gVjzzm7G', 'PRINCIPAL', 'principal'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'system', 'system', true, true, true, 'clerk@schoolms.com', true, 'Robert Smith', '$2a$10$Igjc9Jrznz/gzw4FkwoADeT4hOxwsm.yHaX./G0KH8qi.gVjzzm7G', 'CLERK', 'clerk'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'system', 'system', true, true, true, 'librarian@schoolms.com', true, 'Lisa Wang', '$2a$10$Igjc9Jrznz/gzw4FkwoADeT4hOxwsm.yHaX./G0KH8qi.gVjzzm7G', 'LIBRARIAN', 'librarian');

-- ============================================================================
-- 2. STAFF ROLES (Required for staff records)
-- ============================================================================
INSERT INTO staff_roles (name, description, is_active) VALUES
('Mathematics Teacher', 'Teaches mathematics subjects', true),
('Science Teacher', 'Teaches science subjects', true),
('Principal', 'School administrator and head', true),
('Administrative Clerk', 'Handles administrative tasks', true),
('Librarian', 'Manages school library', true);

-- ============================================================================
-- 3. TEACHER DETAILS (Required for some staff records)
-- ============================================================================
INSERT INTO teacher_details (created_at, updated_at, qualification, specialization, subjects_taught, years_of_experience, department, educational_background, certifications, professional_development) VALUES
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'M.Sc Mathematics', 'Algebra and Calculus', 'Mathematics, Statistics', 8, 'Mathematics', 'B.Sc Mathematics, M.Sc Mathematics', 'Teaching License, Advanced Math Certification', 'Annual Math Conference 2024'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'M.Sc Physics', 'Quantum Physics', 'Physics, Chemistry', 12, 'Science', 'B.Sc Physics, M.Sc Physics', 'Science Teaching License, Lab Safety Certification', 'Science Educators Workshop 2024'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'M.Ed Administration', 'Educational Leadership', 'Administrative Management', 15, 'Administration', 'B.A Education, M.Ed Administration, Ph.D Educational Leadership', 'Principal License, Leadership Certification', 'Educational Leadership Summit 2024'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'B.A Business Administration', 'Office Management', 'Administrative Support', 5, 'Administration', 'B.A Business Administration', 'Office Management Certification', 'Administrative Skills Workshop 2024'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'M.L.I.S', 'Information Systems', 'Library Management', 7, 'Library', 'B.A Literature, M.L.I.S', 'Library Science Certification, Digital Archives Training', 'Modern Library Management Conference 2024');

-- ============================================================================
-- 4. SCHOOL STAFF (5 staff members with relationships)
-- ============================================================================
INSERT INTO school_staff (staff_id, first_name, last_name, email, phone_number, date_of_birth, gender, address, join_date, is_active, active, role, department, designation, emergency_contact, blood_group, qualifications, employment_status, basic_salary, hra, da, user_id, role_id, teacher_details_id) VALUES
('STAFF001', 'Sarah', 'Johnson', 'sarah.johnson@schoolms.com', '+1-555-0101', '1985-03-15', 'FEMALE', '123 Maple Street, Springfield, IL 62701', '2020-08-15', true, true, 'Mathematics Teacher', 'Mathematics', 'Senior Teacher', '+1-555-0102', 'O+', 'M.Sc Mathematics, Teaching License', 'ACTIVE', 55000.00, 11000.00, 5500.00, 2, 1, 1),
('STAFF002', 'Michael', 'Chen', 'michael.chen@schoolms.com', '+1-555-0201', '1980-07-22', 'MALE', '456 Oak Avenue, Springfield, IL 62702', '2018-01-10', true, true, 'Science Teacher', 'Science', 'Department Head', '+1-555-0202', 'A+', 'M.Sc Physics, Science Teaching License', 'ACTIVE', 60000.00, 12000.00, 6000.00, 3, 2, 2),
('STAFF003', 'Emily', 'Rodriguez', 'emily.rodriguez@schoolms.com', '+1-555-0301', '1975-11-08', 'FEMALE', '789 Pine Road, Springfield, IL 62703', '2015-07-01', true, true, 'Principal', 'Administration', 'Principal', '+1-555-0302', 'B+', 'Ph.D Educational Leadership, Principal License', 'ACTIVE', 85000.00, 17000.00, 8500.00, 4, 3, 3),
('STAFF004', 'Robert', 'Smith', 'robert.smith@schoolms.com', '+1-555-0401', '1990-05-14', 'MALE', '321 Elm Street, Springfield, IL 62704', '2021-03-20', true, true, 'Administrative Clerk', 'Administration', 'Senior Clerk', '+1-555-0402', 'AB+', 'B.A Business Administration, Office Management Certification', 'ACTIVE', 40000.00, 8000.00, 4000.00, 5, 4, 4),
('STAFF005', 'Lisa', 'Wang', 'lisa.wang@schoolms.com', '+1-555-0501', '1988-09-30', 'FEMALE', '654 Birch Lane, Springfield, IL 62705', '2019-11-12', true, true, 'Librarian', 'Library', 'Head Librarian', '+1-555-0502', 'O-', 'M.L.I.S, Library Science Certification', 'ACTIVE', 48000.00, 9600.00, 4800.00, 6, 5, 5);

-- ============================================================================
-- 5. FEE STRUCTURES (5 different grade fee structures)
-- ============================================================================
INSERT INTO fee_structures (created_at, updated_at, created_by, modified_by, class_grade, annual_fees, building_fees, lab_fees) VALUES
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 1, 12000.00, 2000.00, 1000.00),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 5, 15000.00, 2500.00, 1500.00),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 8, 18000.00, 3000.00, 2000.00),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 10, 22000.00, 3500.00, 2500.00),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 12, 25000.00, 4000.00, 3000.00);

-- ============================================================================
-- 6. ADMISSIONS (5 admission records, some will be linked to students)
-- ============================================================================
INSERT INTO admissions (created_at, updated_at, created_by, modified_by, applicant_name, date_of_birth, grade_applying, application_date, contact_number, email, address, guardian_name, guardian_contact, guardian_email, blood_group, medical_conditions, previous_school, previous_grade, previous_percentage, status) VALUES
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 'Alex Thompson', '2010-04-12', 8, '2024-03-15', '+1-555-1001', 'alex.thompson@email.com', '111 First Street, Springfield, IL 62706', 'David Thompson', '+1-555-1002', 'david.thompson@email.com', 'A+', 'None', 'Springfield Elementary', '7', '85%', 'APPROVED'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 'Maya Patel', '2012-08-25', 5, '2024-03-20', '+1-555-1101', 'maya.patel@email.com', '222 Second Avenue, Springfield, IL 62707', 'Priya Patel', '+1-555-1102', 'priya.patel@email.com', 'B+', 'Mild asthma', 'Greenwood Elementary', '4', '92%', 'APPROVED'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 'Jordan Williams', '2008-12-03', 10, '2024-03-25', '+1-555-1201', 'jordan.williams@email.com', '333 Third Road, Springfield, IL 62708', 'Michelle Williams', '+1-555-1202', 'michelle.williams@email.com', 'O+', 'None', 'Lincoln Middle School', '9', '88%', 'APPROVED'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 'Zoe Garcia', '2006-06-18', 12, '2024-03-30', '+1-555-1301', 'zoe.garcia@email.com', '444 Fourth Street, Springfield, IL 62709', 'Carlos Garcia', '+1-555-1302', 'carlos.garcia@email.com', 'AB+', 'None', 'Roosevelt High School', '11', '95%', 'APPROVED'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 'Emma Johnson', '2014-01-07', 1, '2024-04-05', '+1-555-1401', 'emma.johnson@email.com', '555 Fifth Avenue, Springfield, IL 62710', 'Jennifer Johnson', '+1-555-1402', 'jennifer.johnson@email.com', 'O-', 'Food allergy (nuts)', 'Sunshine Preschool', 'Kindergarten', '90%', 'PENDING');

-- ============================================================================
-- 7. STUDENTS (5 students linked to approved admissions)
-- ============================================================================
INSERT INTO students (created_at, updated_at, created_by, modified_by, student_id, first_name, last_name, date_of_birth, grade, section, roll_number, email, contact_number, address, guardian_name, guardian_contact, guardian_email, guardian_annual_income, guardian_occupation, guardian_office_address, blood_group, medical_conditions, admission_date, status, house_alloted, transport_mode, bus_route_number, whatsapp_number, aadhar_number, udise_number, subjects, admission_id) VALUES
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 'STU2024001', 'Alex', 'Thompson', '2010-04-12', 8, 'A', 'R8A001', 'alex.thompson@email.com', '+1-555-1001', '111 First Street, Springfield, IL 62706', 'David Thompson', '+1-555-1002', 'david.thompson@email.com', 75000.00, 'Software Engineer', '100 Tech Park, Springfield, IL', 'A+', 'None', '2024-04-01', 'ACTIVE', 'Red House', 'BUS', 'Route-5', '+1-555-1001', '123456789012', 'UDISE001', 'Mathematics, Science, English, Social Studies', 1),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 'STU2024002', 'Maya', 'Patel', '2012-08-25', 5, 'B', 'R5B002', 'maya.patel@email.com', '+1-555-1101', '222 Second Avenue, Springfield, IL 62707', 'Priya Patel', '+1-555-1102', 'priya.patel@email.com', 85000.00, 'Doctor', '200 Medical Center, Springfield, IL', 'B+', 'Mild asthma', '2024-04-01', 'ACTIVE', 'Blue House', 'PRIVATE', null, '+1-555-1101', '123456789013', 'UDISE002', 'Mathematics, Science, English, Hindi, Art', 2),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 'STU2024003', 'Jordan', 'Williams', '2008-12-03', 10, 'A', 'R10A003', 'jordan.williams@email.com', '+1-555-1201', '333 Third Road, Springfield, IL 62708', 'Michelle Williams', '+1-555-1202', 'michelle.williams@email.com', 65000.00, 'Teacher', '300 Education District, Springfield, IL', 'O+', 'None', '2024-04-01', 'ACTIVE', 'Green House', 'BUS', 'Route-3', '+1-555-1201', '123456789014', 'UDISE003', 'Mathematics, Physics, Chemistry, Biology, English', 3),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 'STU2024004', 'Zoe', 'Garcia', '2006-06-18', 12, 'A', 'R12A004', 'zoe.garcia@email.com', '+1-555-1301', '444 Fourth Street, Springfield, IL 62709', 'Carlos Garcia', '+1-555-1302', 'carlos.garcia@email.com', 95000.00, 'Business Owner', '400 Business Plaza, Springfield, IL', 'AB+', 'None', '2024-04-01', 'ACTIVE', 'Yellow House', 'PRIVATE', null, '+1-555-1301', '123456789015', 'UDISE004', 'Mathematics, Physics, Chemistry, Computer Science, English', 4),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'admin', 'admin', 'STU2024005', 'Sam', 'Lee', '2013-11-20', 3, 'C', 'R3C005', 'sam.lee@email.com', '+1-555-1501', '666 Sixth Street, Springfield, IL 62711', 'Helen Lee', '+1-555-1502', 'helen.lee@email.com', 55000.00, 'Nurse', '500 Hospital Way, Springfield, IL', 'A-', 'None', '2024-04-01', 'ACTIVE', 'Red House', 'WALKING', null, '+1-555-1501', '123456789016', 'UDISE005', 'Mathematics, English, Science, Art, Music', null);

-- ============================================================================
-- 8. ATTENDANCE (Comprehensive attendance records with all possible status values)
-- ============================================================================
-- Current day attendance (July 1, 2024)
INSERT INTO attendance (created_at, updated_at, created_by, modified_by, student_id, date, status, check_in_time, check_out_time, remarks) VALUES
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 1, '2024-07-01', 'PRESENT', '08:15:00', '15:30:00', 'On time'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 2, '2024-07-01', 'LATE', '08:45:00', '15:30:00', 'Traffic delay - arrived 15 minutes late'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher2', 'teacher2', 3, '2024-07-01', 'ABSENT', null, null, 'Medical appointment with doctor'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher2', 'teacher2', 4, '2024-07-01', 'PRESENT', '08:10:00', '15:30:00', 'Early arrival'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 5, '2024-07-01', 'HALF_DAY', '08:20:00', '12:00:00', 'Left early for family function'),

-- Previous day attendance (June 30, 2024) - showing different statuses
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 1, '2024-06-30', 'HALF_DAY', '08:15:00', '12:30:00', 'Early dismissal for dental appointment'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 2, '2024-06-30', 'PRESENT', '08:18:00', '15:30:00', 'Regular attendance'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher2', 'teacher2', 3, '2024-06-30', 'ON_LEAVE', null, null, 'Pre-approved family vacation'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher2', 'teacher2', 4, '2024-06-30', 'LATE', '08:50:00', '15:30:00', 'Bus breakdown delay'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 5, '2024-06-30', 'ABSENT', null, null, 'Sick with fever'),

-- Weekend/Holiday attendance (June 29, 2024 - Saturday)
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'system', 'system', 1, '2024-06-29', 'HOLIDAY', null, null, 'Weekend - Saturday'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'system', 'system', 2, '2024-06-29', 'HOLIDAY', null, null, 'Weekend - Saturday'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'system', 'system', 3, '2024-06-29', 'HOLIDAY', null, null, 'Weekend - Saturday'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'system', 'system', 4, '2024-06-29', 'HOLIDAY', null, null, 'Weekend - Saturday'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'system', 'system', 5, '2024-06-29', 'HOLIDAY', null, null, 'Weekend - Saturday'),

-- Additional day showing more variety (June 28, 2024)
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 1, '2024-06-28', 'LATE', '08:35:00', '15:30:00', 'Overslept - alarm malfunction'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 2, '2024-06-28', 'ON_LEAVE', null, null, 'Family wedding celebration'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher2', 'teacher2', 3, '2024-06-28', 'PRESENT', '08:12:00', '15:30:00', 'Perfect attendance'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher2', 'teacher2', 4, '2024-06-28', 'HALF_DAY', '08:15:00', '11:45:00', 'Left for medical checkup'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 5, '2024-06-28', 'PRESENT', '08:25:00', '15:30:00', 'Normal day'),

-- One more day for complete coverage (June 27, 2024)
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 1, '2024-06-27', 'ON_LEAVE', null, null, 'Educational field trip approval'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 2, '2024-06-27', 'ABSENT', null, null, 'Stomach flu - contagious'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher2', 'teacher2', 3, '2024-06-27', 'HALF_DAY', '08:15:00', '13:00:00', 'Early dismissal for orthodontist'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher2', 'teacher2', 4, '2024-06-27', 'PRESENT', '08:05:00', '15:30:00', 'Excellent punctuality'),
('2024-07-04 10:00:00', '2024-07-04 10:00:00', 'teacher1', 'teacher1', 5, '2024-06-27', 'LATE', '09:10:00', '15:30:00', 'Car trouble - called parents');

-- ============================================================================
-- DATA LOADING COMPLETE
-- ============================================================================
-- Summary:
-- - 5 Additional Users (plus existing admin = 6 total)
-- - 5 Staff Roles
-- - 5 Teacher Details
-- - 5 School Staff members
-- - 5 Fee Structures (for grades 1, 5, 8, 10, 12)
-- - 5 Admission records
-- - 5 Students (4 linked to admissions, 1 direct)
-- - 25 Attendance records (5 students × 5 days with ALL status types)
-- 
-- Attendance Status Coverage:
-- ✅ PRESENT   - Regular attendance
-- ✅ ABSENT    - Student not in school  
-- ✅ LATE      - Arrived after start time
-- ✅ HALF_DAY  - Left early or came late for half day
-- ✅ ON_LEAVE  - Pre-approved absence
-- ✅ HOLIDAY   - School closed day (weekends/holidays)
-- 
-- All foreign key relationships are properly maintained
-- Data includes realistic information with proper constraints
-- Comprehensive test data for attendance system validation
-- ============================================================================
