-- ============================================================================
-- INDIAN SCHOOL DUMMY DATA FOR SCHOOL MANAGEMENT SYSTEM
-- ============================================================================
-- This script creates realistic test data for an Indian school
-- Run this AFTER the consolidated_school_database.sql script
-- 
-- This script includes:
-- 1. Database structure fixes (gender values, payments table, etc.)
-- 2. Indian-localized dummy data (staff, students, fees, etc.)
-- 
-- Usage: psql -U postgres -d school_db -p 5435 -f dummy_data_seed_india.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 0: DATABASE STRUCTURE FIXES
-- ============================================================================

-- Fix gender values from 'Male'/'Female' to 'MALE'/'FEMALE'
UPDATE school_staff SET gender = 'MALE' WHERE gender = 'Male';
UPDATE school_staff SET gender = 'FEMALE' WHERE gender = 'Female';
UPDATE students SET gender = 'MALE' WHERE gender = 'Male';
UPDATE students SET gender = 'FEMALE' WHERE gender = 'Female';

-- Fix payments table structure
ALTER TABLE payments ADD COLUMN IF NOT EXISTS fee_id BIGINT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_name VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_contact_info VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_relation_to_student VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS void_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS voided_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(255);
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payment_fee;
ALTER TABLE payments ADD CONSTRAINT fk_payment_fee FOREIGN KEY (fee_id) REFERENCES fees(id);

-- Fix payment_schedules table structure
ALTER TABLE payment_schedules ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE payment_schedules ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(50);
UPDATE payment_schedules SET is_enabled = TRUE WHERE is_enabled IS NULL;
UPDATE payment_schedules SET schedule_type = 'QUARTERLY' WHERE schedule_type IS NULL;

-- Fix late_fees table structure
ALTER TABLE late_fees ADD COLUMN IF NOT EXISTS month_value INTEGER;
ALTER TABLE late_fees ADD COLUMN IF NOT EXISTS late_fee_amount NUMERIC(15,2);
ALTER TABLE late_fees ADD COLUMN IF NOT EXISTS late_fee_description TEXT;
ALTER TABLE late_fees ADD COLUMN IF NOT EXISTS fine_amount NUMERIC(15,2);
ALTER TABLE late_fees ADD COLUMN IF NOT EXISTS fine_description TEXT;
UPDATE late_fees SET month_value = 1 WHERE month_value IS NULL;
UPDATE late_fees SET late_fee_amount = penalty_amount WHERE late_fee_amount IS NULL AND penalty_amount IS NOT NULL;
UPDATE late_fees SET fine_amount = penalty_amount WHERE fine_amount IS NULL AND penalty_amount IS NOT NULL;

-- ============================================================================
-- PART 1: STAFF DATA (10 staff members with Indian context)
-- ============================================================================

INSERT INTO school_staff (
    staff_id, first_name, last_name, email, phone, date_of_birth, gender, 
    address, city, state, pin_code,
    join_date, employment_status, department, designation, basic_salary,
    qualifications, is_active
) VALUES
('STF001', 'Rajesh', 'Kumar', 'rajesh.kumar@school.com', '9876543210', '1985-03-15', 'MALE',
 'A-123, Sector 15, Rohini', 'New Delhi', 'Delhi', '110085',
 '2015-08-01', 'ACTIVE', 'Mathematics', 'Senior Teacher', 55000.00,
 'M.Sc. Mathematics, B.Ed., 8 years experience', TRUE),

('STF002', 'Priya', 'Sharma', 'priya.sharma@school.com', '9876543211', '1988-07-22', 'FEMALE',
 'B-456, Andheri West', 'Mumbai', 'Maharashtra', '400058',
 '2017-08-15', 'ACTIVE', 'English', 'Teacher', 48000.00,
 'M.A. English Literature, B.Ed., 6 years experience', TRUE),

('STF003', 'Amit', 'Patel', 'amit.patel@school.com', '9876543212', '1982-11-30', 'MALE',
 'C-789, Satellite Road', 'Ahmedabad', 'Gujarat', '380015',
 '2012-07-01', 'ACTIVE', 'Science', 'Head of Department', 62000.00,
 'M.Sc. Physics, Ph.D., B.Ed., 11 years experience', TRUE),

('STF004', 'Sneha', 'Reddy', 'sneha.reddy@school.com', '9876543213', '1990-05-18', 'FEMALE',
 'D-321, Banjara Hills', 'Hyderabad', 'Telangana', '500034',
 '2018-08-20', 'ACTIVE', 'History', 'Teacher', 47000.00,
 'M.A. History, B.Ed., 5 years experience', TRUE),

('STF005', 'Vikram', 'Singh', 'vikram.singh@school.com', '9876543214', '1987-09-25', 'MALE',
 'E-654, Civil Lines', 'Jaipur', 'Rajasthan', '302006',
 '2016-08-10', 'ACTIVE', 'Physical Education', 'Sports Coordinator', 50000.00,
 'B.P.Ed., M.P.Ed., 7 years experience', TRUE),

('STF006', 'Kavita', 'Nair', 'kavita.nair@school.com', '9876543215', '1983-12-08', 'FEMALE',
 'F-987, Indiranagar', 'Bangalore', 'Karnataka', '560038',
 '2014-09-01', 'ACTIVE', 'Library', 'Head Librarian', 45000.00,
 'M.L.I.Sc., 9 years experience', TRUE),

('STF007', 'Suresh', 'Iyer', 'suresh.iyer@school.com', '9876543216', '1980-04-12', 'MALE',
 'G-147, Anna Nagar', 'Chennai', 'Tamil Nadu', '600040',
 '2010-07-15', 'ACTIVE', 'Administration', 'Principal', 85000.00,
 'M.Ed., M.A. Education, 13 years experience', TRUE),

('STF008', 'Anjali', 'Gupta', 'anjali.gupta@school.com', '9876543217', '1992-08-30', 'FEMALE',
 'H-258, Gomti Nagar', 'Lucknow', 'Uttar Pradesh', '226010',
 '2019-08-01', 'ACTIVE', 'Administration', 'Admin Officer', 42000.00,
 'B.Com., MBA, 4 years experience', TRUE),

('STF009', 'Ramesh', 'Verma', 'ramesh.verma@school.com', '9876543218', '1986-02-14', 'MALE',
 'I-369, Boring Road', 'Patna', 'Bihar', '800001',
 '2015-09-01', 'ACTIVE', 'Accounts', 'Account Officer', 48000.00,
 'M.Com., CA Inter, 8 years experience', TRUE),

('STF010', 'Deepa', 'Menon', 'deepa.menon@school.com', '9876543219', '1989-06-20', 'FEMALE',
 'J-741, Koramangala', 'Bangalore', 'Karnataka', '560034',
 '2017-08-15', 'ACTIVE', 'Computer Science', 'IT Teacher', 52000.00,
 'M.Sc. Computer Science, B.Ed., 6 years experience', TRUE);


-- ============================================================================
-- PART 2: STUDENT DATA (18 students across different classes)
-- ============================================================================

INSERT INTO students (
    student_id, first_name, last_name, date_of_birth, gender, email, contact_number,
    address, admission_date, grade, section, roll_number,
    guardian_name, guardian_contact, guardian_email,
    blood_group, medical_conditions, status
) VALUES
('STU001', 'Aarav', 'Sharma', '2018-01-15', 'MALE', 'aarav.sharma@student.com', '9876501001',
 'Flat 101, Green Park, New Delhi, Delhi 110016', '2024-08-01', 1, 'A', '1A001', 
 'Rakesh Sharma', '9876502001', 'rakesh.sharma@parent.com', 'O+', NULL, 'ACTIVE'),

('STU002', 'Ananya', 'Patel', '2018-03-22', 'FEMALE', 'ananya.patel@student.com', '9876501002',
 'B-202, Juhu, Mumbai, Maharashtra 400049', '2024-08-01', 1, 'A', '1A002', 
 'Suresh Patel', '9876502002', 'suresh.patel@parent.com', 'A+', NULL, 'ACTIVE'),

('STU003', 'Arjun', 'Kumar', '2018-05-10', 'MALE', 'arjun.kumar@student.com', '9876501003',
 'C-303, Whitefield, Bangalore, Karnataka 560066', '2024-08-01', 1, 'B', '1B001', 
 'Vijay Kumar', '9876502003', 'vijay.kumar@parent.com', 'B+', NULL, 'ACTIVE'),

('STU004', 'Diya', 'Singh', '2017-02-18', 'FEMALE', 'diya.singh@student.com', '9876501004',
 'D-404, Sector 21, Noida, Uttar Pradesh 201301', '2023-08-01', 2, 'A', '2A001', 
 'Rajiv Singh', '9876502004', 'rajiv.singh@parent.com', 'AB+', NULL, 'ACTIVE'),

('STU005', 'Ishaan', 'Reddy', '2017-04-25', 'MALE', 'ishaan.reddy@student.com', '9876501005',
 'E-505, Hitech City, Hyderabad, Telangana 500081', '2023-08-01', 2, 'A', '2A002', 
 'Kiran Reddy', '9876502005', 'kiran.reddy@parent.com', 'O-', NULL, 'ACTIVE'),

('STU006', 'Kavya', 'Nair', '2016-06-12', 'FEMALE', 'kavya.nair@student.com', '9876501006',
 'F-606, Marine Drive, Kochi, Kerala 682031', '2022-08-01', 3, 'A', '3A001', 
 'Sunil Nair', '9876502006', 'sunil.nair@parent.com', 'A-', NULL, 'ACTIVE'),

('STU007', 'Rohan', 'Gupta', '2016-08-20', 'MALE', 'rohan.gupta@student.com', '9876501007',
 'G-707, Park Street, Kolkata, West Bengal 700016', '2022-08-01', 3, 'B', '3B001', 
 'Anil Gupta', '9876502007', 'anil.gupta@parent.com', 'B-', NULL, 'ACTIVE'),

('STU008', 'Saanvi', 'Iyer', '2015-01-30', 'FEMALE', 'saanvi.iyer@student.com', '9876501008',
 'H-808, T Nagar, Chennai, Tamil Nadu 600017', '2021-08-01', 4, 'A', '4A001', 
 'Ramesh Iyer', '9876502008', 'ramesh.iyer@parent.com', 'O+', NULL, 'ACTIVE'),

('STU009', 'Vihaan', 'Joshi', '2015-03-15', 'MALE', 'vihaan.joshi@student.com', '9876501009',
 'I-909, Shivaji Nagar, Pune, Maharashtra 411005', '2021-08-01', 4, 'B', '4B001', 
 'Prakash Joshi', '9876502009', 'prakash.joshi@parent.com', 'A+', NULL, 'ACTIVE'),

('STU010', 'Aisha', 'Khan', '2014-05-22', 'FEMALE', 'aisha.khan@student.com', '9876501010',
 'J-1010, Banjara Hills, Hyderabad, Telangana 500034', '2020-08-01', 5, 'A', '5A001', 
 'Salman Khan', '9876502010', 'salman.khan@parent.com', 'B+', 'Asthma', 'ACTIVE'),

('STU011', 'Aditya', 'Verma', '2014-07-18', 'MALE', 'aditya.verma@student.com', '9876501011',
 'K-1111, Hazratganj, Lucknow, Uttar Pradesh 226001', '2020-08-01', 5, 'B', '5B001', 
 'Manoj Verma', '9876502011', 'manoj.verma@parent.com', 'AB-', NULL, 'ACTIVE'),

('STU012', 'Myra', 'Desai', '2013-09-10', 'FEMALE', 'myra.desai@student.com', '9876501012',
 'L-1212, Satellite, Ahmedabad, Gujarat 380015', '2019-08-01', 6, 'A', '6A001', 
 'Nitin Desai', '9876502012', 'nitin.desai@parent.com', 'O-', NULL, 'ACTIVE'),

('STU013', 'Kabir', 'Malhotra', '2012-11-25', 'MALE', 'kabir.malhotra@student.com', '9876501013',
 'M-1313, Vasant Vihar, New Delhi, Delhi 110057', '2018-08-01', 7, 'A', '7A001', 
 'Sanjay Malhotra', '9876502013', 'sanjay.malhotra@parent.com', 'A+', NULL, 'ACTIVE'),

('STU014', 'Aadhya', 'Pillai', '2011-02-14', 'FEMALE', 'aadhya.pillai@student.com', '9876501014',
 'N-1414, Jayanagar, Bangalore, Karnataka 560041', '2017-08-01', 8, 'A', '8A001', 
 'Ravi Pillai', '9876502014', 'ravi.pillai@parent.com', 'B+', NULL, 'ACTIVE'),

('STU015', 'Aryan', 'Chopra', '2010-04-20', 'MALE', 'aryan.chopra@student.com', '9876501015',
 'O-1515, Connaught Place, New Delhi, Delhi 110001', '2016-08-01', 9, 'A', '9A001', 
 'Vikram Chopra', '9876502015', 'vikram.chopra@parent.com', 'AB+', NULL, 'ACTIVE'),

('STU016', 'Navya', 'Rao', '2009-06-30', 'FEMALE', 'navya.rao@student.com', '9876501016',
 'P-1616, Jubilee Hills, Hyderabad, Telangana 500033', '2015-08-01', 10, 'A', '10A001', 
 'Krishna Rao', '9876502016', 'krishna.rao@parent.com', 'O+', NULL, 'ACTIVE'),

('STU017', 'Reyansh', 'Bansal', '2008-08-15', 'MALE', 'reyansh.bansal@student.com', '9876501017',
 'Q-1717, Rajouri Garden, New Delhi, Delhi 110027', '2014-08-01', 11, 'A', '11A001', 
 'Ashok Bansal', '9876502017', 'ashok.bansal@parent.com', 'A-', NULL, 'ACTIVE'),

('STU018', 'Kiara', 'Mehta', '2007-10-22', 'FEMALE', 'kiara.mehta@student.com', '9876501018',
 'R-1818, Powai, Mumbai, Maharashtra 400076', '2013-08-01', 12, 'A', '12A001', 
 'Rajesh Mehta', '9876502018', 'rajesh.mehta@parent.com', 'B-', NULL, 'ACTIVE');


-- ============================================================================
-- PART 3: ADMISSIONS DATA
-- ============================================================================

INSERT INTO admissions (
    applicant_name, date_of_birth, email, contact_number,
    address, grade_applying, guardian_name, guardian_contact, guardian_email,
    previous_school, status, application_date, blood_group
) VALUES
('Advait Saxena', '2018-02-10', 'advait.saxena@applicant.com', '9876503001',
 'S-1919, Dwarka, New Delhi, Delhi 110075', 1, 'Mohan Saxena', '9876504001', 'mohan.saxena@parent.com',
 'Little Angels Preschool', 'PENDING', '2025-01-15', 'O+'),

('Pari Agarwal', '2017-04-18', 'pari.agarwal@applicant.com', '9876503002',
 'T-2020, Malad, Mumbai, Maharashtra 400064', 2, 'Sunil Agarwal', '9876504002', 'sunil.agarwal@parent.com',
 'Sunshine Public School', 'APPROVED', '2025-01-10', 'A+'),

('Vivaan Kapoor', '2016-06-25', 'vivaan.kapoor@applicant.com', '9876503003',
 'U-2121, Sector 62, Noida, Uttar Pradesh 201309', 3, 'Amit Kapoor', '9876504003', 'amit.kapoor@parent.com',
 NULL, 'PENDING', '2025-01-20', 'B+'),

('Ira Bhatt', '2015-08-12', 'ira.bhatt@applicant.com', '9876503004',
 'V-2222, Vastrapur, Ahmedabad, Gujarat 380015', 4, 'Deepak Bhatt', '9876504004', 'deepak.bhatt@parent.com',
 'Green Valley School', 'REJECTED', '2025-01-05', 'AB-');

-- ============================================================================
-- PART 4: STAFF ATTENDANCE DATA (Last 30 days)
-- ============================================================================

-- Note: staff_attendance uses columns: staff_id, attendance_date, status, note
INSERT INTO staff_attendance (staff_id, attendance_date, status, note)
SELECT 
    s.id,
    CURRENT_DATE - (n || ' days')::INTERVAL,
    CASE 
        WHEN EXTRACT(DOW FROM CURRENT_DATE - (n || ' days')::INTERVAL) IN (0) THEN 'HOLIDAY'
        WHEN n % 15 = 0 THEN 'ABSENT'
        WHEN n % 10 = 0 THEN 'HALF_DAY'
        ELSE 'PRESENT'
    END,
    CASE 
        WHEN n % 15 = 0 THEN 'Sick leave'
        WHEN n % 10 = 0 THEN 'Personal work'
        ELSE NULL
    END
FROM school_staff s
CROSS JOIN generate_series(0, 29) AS n
WHERE s.is_active = TRUE;

-- ============================================================================
-- PART 5: STUDENT ATTENDANCE DATA (Last 30 days)
-- ============================================================================

-- Note: The table is called 'attendance' not 'student_attendance'
INSERT INTO attendance (student_id, date, status, remarks)
SELECT 
    st.id,
    CURRENT_DATE - (n || ' days')::INTERVAL,
    CASE 
        WHEN EXTRACT(DOW FROM CURRENT_DATE - (n || ' days')::INTERVAL) IN (0) THEN 'HOLIDAY'
        WHEN n % 20 = 0 THEN 'ABSENT'
        WHEN n % 12 = 0 THEN 'LATE'
        ELSE 'PRESENT'
    END,
    CASE 
        WHEN n % 20 = 0 THEN 'Sick'
        WHEN n % 12 = 0 THEN 'Traffic delay'
        ELSE NULL
    END
FROM students st
CROSS JOIN generate_series(0, 29) AS n
WHERE st.status = 'ACTIVE';

-- ============================================================================
-- PART 6: SCHOOL HOLIDAYS (Indian Calendar)
-- ============================================================================

INSERT INTO school_holidays (date, name, description)
VALUES
('2025-01-26', 'Republic Day', 'National holiday celebrating the Constitution of India'),
('2025-03-14', 'Holi', 'Festival of colors'),
('2025-04-10', 'Mahavir Jayanti', 'Birth anniversary of Lord Mahavir'),
('2025-04-14', 'Ambedkar Jayanti', 'Birth anniversary of Dr. B.R. Ambedkar'),
('2025-04-18', 'Good Friday', 'Christian holiday'),
('2025-05-01', 'May Day', 'International Workers Day'),
('2025-05-23', 'Buddha Purnima', 'Birth anniversary of Gautama Buddha'),
('2025-08-15', 'Independence Day', 'National holiday celebrating independence from British rule'),
('2025-08-27', 'Janmashtami', 'Birth of Lord Krishna'),
('2025-10-02', 'Gandhi Jayanti', 'Birth anniversary of Mahatma Gandhi'),
('2025-10-12', 'Dussehra', 'Victory of good over evil'),
('2025-10-31', 'Diwali', 'Festival of lights'),
('2025-11-05', 'Guru Nanak Jayanti', 'Birth anniversary of Guru Nanak Dev'),
('2025-12-25', 'Christmas', 'Birth of Jesus Christ'),
('2025-12-20', 'Winter Break Start', 'Winter vacation begins'),
('2026-01-05', 'Winter Break End', 'Winter vacation ends');

-- ============================================================================
-- PART 7: FEE STRUCTURES (Indian Rupees - ₹)
-- ============================================================================

INSERT INTO fee_structures (class_grade, annual_fees, building_fees, lab_fees)
VALUES
(1, 25000.00, 2500.00, 1500.00),
(2, 25000.00, 2500.00, 1500.00),
(3, 28000.00, 2800.00, 1700.00),
(4, 28000.00, 2800.00, 1700.00),
(5, 30000.00, 3000.00, 2000.00),
(6, 35000.00, 3500.00, 2500.00),
(7, 35000.00, 3500.00, 2500.00),
(8, 38000.00, 3800.00, 2700.00),
(9, 42000.00, 4200.00, 3000.00),
(10, 42000.00, 4200.00, 3000.00),
(11, 45000.00, 4500.00, 3500.00),
(12, 45000.00, 4500.00, 3500.00)
ON CONFLICT (class_grade) DO NOTHING;

-- ============================================================================
-- PART 8: TRANSPORT ROUTES (Indian Cities)
-- ============================================================================

INSERT INTO transport_routes (route_name, route_number, fee_amount, description)
VALUES
('North Delhi Route', 'R001', 6000.00, 'Covers Rohini, Pitampura, Shalimar Bagh areas'),
('South Delhi Route', 'R002', 5500.00, 'Covers Saket, Hauz Khas, Greater Kailash areas'),
('East Delhi Route', 'R003', 5800.00, 'Covers Mayur Vihar, Laxmi Nagar, Preet Vihar areas'),
('West Delhi Route', 'R004', 6200.00, 'Covers Janakpuri, Rajouri Garden, Punjabi Bagh areas'),
('Noida Route', 'R005', 7000.00, 'Covers Noida Sector 15, 18, 62 areas');

-- ============================================================================
-- PART 9: STUDENT FEE ASSIGNMENTS
-- ============================================================================
-- Assign fee structures to all active students based on their grade

INSERT INTO student_fee_assignments (student_id, fee_structure_id, assigned_date, status)
SELECT 
    s.id,
    fs.id,
    s.admission_date,
    'ACTIVE'
FROM students s
JOIN fee_structures fs ON s.grade = fs.class_grade
WHERE s.status = 'ACTIVE';

-- ============================================================================
-- PART 10: PAYMENT SCHEDULES (Quarterly Installments)
-- ============================================================================
-- Create quarterly payment schedules for each fee structure

INSERT INTO payment_schedules (fee_structure_id, installment_number, due_date, amount, description)
SELECT 
    id,
    1,
    '2025-04-15'::DATE,
    (annual_fees + building_fees + lab_fees) / 4,
    'First Quarter - April-June 2025'
FROM fee_structures;

INSERT INTO payment_schedules (fee_structure_id, installment_number, due_date, amount, description)
SELECT 
    id,
    2,
    '2025-07-15'::DATE,
    (annual_fees + building_fees + lab_fees) / 4,
    'Second Quarter - July-September 2025'
FROM fee_structures;

INSERT INTO payment_schedules (fee_structure_id, installment_number, due_date, amount, description)
SELECT 
    id,
    3,
    '2025-10-15'::DATE,
    (annual_fees + building_fees + lab_fees) / 4,
    'Third Quarter - October-December 2025'
FROM fee_structures;

INSERT INTO payment_schedules (fee_structure_id, installment_number, due_date, amount, description)
SELECT 
    id,
    4,
    '2026-01-15'::DATE,
    (annual_fees + building_fees + lab_fees) / 4,
    'Fourth Quarter - January-March 2026'
FROM fee_structures;

-- ============================================================================
-- PART 11: LATE FEE PENALTIES
-- ============================================================================
-- Define late fee penalties for each fee structure

INSERT INTO late_fees (fee_structure_id, days_late, penalty_amount, penalty_percentage)
SELECT 
    id,
    7,
    500.00,
    2.00
FROM fee_structures;

INSERT INTO late_fees (fee_structure_id, days_late, penalty_amount, penalty_percentage)
SELECT 
    id,
    15,
    1000.00,
    5.00
FROM fee_structures;

INSERT INTO late_fees (fee_structure_id, days_late, penalty_amount, penalty_percentage)
SELECT 
    id,
    30,
    2000.00,
    10.00
FROM fee_structures;

-- ============================================================================
-- PART 12: FEE PAYMENTS (Sample payments for some students)
-- ============================================================================
-- Add some completed payments for students

-- First quarter payments (some students have paid)
INSERT INTO fee_payments (student_id, fee_structure_id, amount, payment_date, payment_method, transaction_id, status, remarks)
SELECT 
    s.id,
    fs.id,
    (fs.annual_fees + fs.building_fees + fs.lab_fees) / 4,
    '2025-04-10'::DATE,
    CASE (s.id % 3)
        WHEN 0 THEN 'ONLINE'
        WHEN 1 THEN 'CASH'
        ELSE 'CHEQUE'
    END,
    'TXN' || LPAD(s.id::TEXT, 8, '0') || '001',
    'COMPLETED',
    'First quarter payment - Academic Year 2025-26'
FROM students s
JOIN fee_structures fs ON s.grade = fs.class_grade
WHERE s.status = 'ACTIVE' AND s.id <= 12;  -- First 12 students have paid

-- Some students paid second quarter as well
INSERT INTO fee_payments (student_id, fee_structure_id, amount, payment_date, payment_method, transaction_id, status, remarks)
SELECT 
    s.id,
    fs.id,
    (fs.annual_fees + fs.building_fees + fs.lab_fees) / 4,
    '2025-07-08'::DATE,
    CASE (s.id % 3)
        WHEN 0 THEN 'ONLINE'
        WHEN 1 THEN 'UPI'
        ELSE 'CARD'
    END,
    'TXN' || LPAD(s.id::TEXT, 8, '0') || '002',
    'COMPLETED',
    'Second quarter payment - Academic Year 2025-26'
FROM students s
JOIN fee_structures fs ON s.grade = fs.class_grade
WHERE s.status = 'ACTIVE' AND s.id <= 8;  -- First 8 students have paid Q2

-- ============================================================================
-- PART 13: ADDITIONAL FEES (Exam fees, Activity fees, etc.)
-- ============================================================================

INSERT INTO fees (name, grade, amount, due_date, fee_type, description, frequency)
VALUES
-- Exam fees for all grades
('Mid-Term Examination Fee', 1, 500.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 1', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 2, 500.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 2', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 3, 600.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 3', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 4, 600.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 4', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 5, 700.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 5', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 6, 800.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 6', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 7, 800.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 7', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 8, 900.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 8', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 9, 1000.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 9', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 10, 1000.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 10', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 11, 1200.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 11', 'HALF_YEARLY'),
('Mid-Term Examination Fee', 12, 1200.00, '2025-09-01', 'EXAM', 'Mid-term examination fee for Class 12', 'HALF_YEARLY'),

-- Annual Day and Sports fees
('Annual Day Fee', 1, 1000.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 2, 1000.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 3, 1200.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 4, 1200.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 5, 1500.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 6, 1500.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 7, 1500.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 8, 1500.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 9, 2000.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 10, 2000.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 11, 2000.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),
('Annual Day Fee', 12, 2000.00, '2025-11-01', 'EVENT', 'Annual day celebration and cultural activities', 'YEARLY'),

-- Computer Lab Fee (for higher classes)
('Computer Lab Fee', 6, 3000.00, '2025-04-15', 'LAB', 'Computer lab usage and maintenance', 'YEARLY'),
('Computer Lab Fee', 7, 3000.00, '2025-04-15', 'LAB', 'Computer lab usage and maintenance', 'YEARLY'),
('Computer Lab Fee', 8, 3500.00, '2025-04-15', 'LAB', 'Computer lab usage and maintenance', 'YEARLY'),
('Computer Lab Fee', 9, 4000.00, '2025-04-15', 'LAB', 'Computer lab usage and maintenance', 'YEARLY'),
('Computer Lab Fee', 10, 4000.00, '2025-04-15', 'LAB', 'Computer lab usage and maintenance', 'YEARLY'),
('Computer Lab Fee', 11, 5000.00, '2025-04-15', 'LAB', 'Computer lab usage and maintenance', 'YEARLY'),
('Computer Lab Fee', 12, 5000.00, '2025-04-15', 'LAB', 'Computer lab usage and maintenance', 'YEARLY'),

-- Library Fee
('Library Fee', 1, 800.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 2, 800.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 3, 1000.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 4, 1000.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 5, 1200.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 6, 1500.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 7, 1500.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 8, 1800.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 9, 2000.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 10, 2000.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 11, 2500.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY'),
('Library Fee', 12, 2500.00, '2025-04-15', 'LIBRARY', 'Library books and resources', 'YEARLY');

-- ============================================================================
-- PART 14: TIMETABLE REQUIREMENTS (Weekly period requirements for each class/section)
-- ============================================================================

-- First, we need to get section IDs for sections A, B, C
-- Assuming grade_levels and sections tables are populated with grades 1-12 and sections A, B, C

-- Timetable Requirements for Class 6-A (Primary focus on foundational subjects)
INSERT INTO timetable_requirements (class_id, section_id, subject_id, weekly_periods, notes)
SELECT 
    c.id,
    (SELECT cs.section_id FROM class_sections cs 
     JOIN grade_levels gl ON cs.grade_id = gl.id 
     JOIN sections s ON cs.section_id = s.id 
     WHERE gl.grade_number = 6 AND s.section_name = 'A' LIMIT 1),
    s.id,
    CASE 
        WHEN s.code = 'MATH01' THEN 6
        WHEN s.code = 'ENG01' THEN 5
        WHEN s.code = 'SCI01' THEN 5
        WHEN s.code = 'SS01' THEN 4
        WHEN s.code = 'HIN01' THEN 4
        WHEN s.code = 'CS01' THEN 2
        WHEN s.code = 'PE01' THEN 2
    END,
    CASE 
        WHEN s.code = 'MATH01' THEN 'Core subject - daily practice needed'
        WHEN s.code = 'ENG01' THEN 'Language development focus'
        WHEN s.code = 'SCI01' THEN 'Includes lab sessions'
        WHEN s.code = 'CS01' THEN 'Computer lab sessions'
        WHEN s.code = 'PE01' THEN 'Physical education and sports'
    END
FROM classes c
CROSS JOIN subjects s
WHERE c.name = 'Class 6' 
  AND s.code IN ('MATH01', 'ENG01', 'SCI01', 'SS01', 'HIN01', 'CS01', 'PE01');

-- Timetable Requirements for Class 7-A
INSERT INTO timetable_requirements (class_id, section_id, subject_id, weekly_periods, notes)
SELECT 
    c.id,
    (SELECT cs.section_id FROM class_sections cs 
     JOIN grade_levels gl ON cs.grade_id = gl.id 
     JOIN sections s ON cs.section_id = s.id 
     WHERE gl.grade_number = 7 AND s.section_name = 'A' LIMIT 1),
    s.id,
    CASE 
        WHEN s.code = 'MATH01' THEN 6
        WHEN s.code = 'ENG01' THEN 5
        WHEN s.code = 'SCI01' THEN 5
        WHEN s.code = 'SS01' THEN 4
        WHEN s.code = 'HIN01' THEN 4
        WHEN s.code = 'CS01' THEN 2
        WHEN s.code = 'PE01' THEN 2
    END,
    'Standard curriculum for Class 7'
FROM classes c
CROSS JOIN subjects s
WHERE c.name = 'Class 7' 
  AND s.code IN ('MATH01', 'ENG01', 'SCI01', 'SS01', 'HIN01', 'CS01', 'PE01');

-- Timetable Requirements for Class 8-A
INSERT INTO timetable_requirements (class_id, section_id, subject_id, weekly_periods, notes)
SELECT 
    c.id,
    (SELECT cs.section_id FROM class_sections cs 
     JOIN grade_levels gl ON cs.grade_id = gl.id 
     JOIN sections s ON cs.section_id = s.id 
     WHERE gl.grade_number = 8 AND s.section_name = 'A' LIMIT 1),
    s.id,
    CASE 
        WHEN s.code = 'MATH01' THEN 6
        WHEN s.code = 'ENG01' THEN 5
        WHEN s.code = 'SCI01' THEN 5
        WHEN s.code = 'SS01' THEN 4
        WHEN s.code = 'HIN01' THEN 4
        WHEN s.code = 'CS01' THEN 3
        WHEN s.code = 'PE01' THEN 2
    END,
    'Increased computer science focus'
FROM classes c
CROSS JOIN subjects s
WHERE c.name = 'Class 8' 
  AND s.code IN ('MATH01', 'ENG01', 'SCI01', 'SS01', 'HIN01', 'CS01', 'PE01');

-- Timetable Requirements for Class 9-A (Pre-board preparation)
INSERT INTO timetable_requirements (class_id, section_id, subject_id, weekly_periods, notes)
SELECT 
    c.id,
    (SELECT cs.section_id FROM class_sections cs 
     JOIN grade_levels gl ON cs.grade_id = gl.id 
     JOIN sections s ON cs.section_id = s.id 
     WHERE gl.grade_number = 9 AND s.section_name = 'A' LIMIT 1),
    s.id,
    CASE 
        WHEN s.code = 'MATH01' THEN 7
        WHEN s.code = 'ENG01' THEN 5
        WHEN s.code = 'SCI01' THEN 6
        WHEN s.code = 'SS01' THEN 5
        WHEN s.code = 'HIN01' THEN 4
        WHEN s.code = 'CS01' THEN 2
        WHEN s.code = 'PE01' THEN 2
    END,
    'Board exam preparation begins'
FROM classes c
CROSS JOIN subjects s
WHERE c.name = 'Class 9' 
  AND s.code IN ('MATH01', 'ENG01', 'SCI01', 'SS01', 'HIN01', 'CS01', 'PE01');

-- Timetable Requirements for Class 10-A (Board exam year - CBSE pattern)
INSERT INTO timetable_requirements (class_id, section_id, subject_id, weekly_periods, notes)
SELECT 
    c.id,
    (SELECT cs.section_id FROM class_sections cs 
     JOIN grade_levels gl ON cs.grade_id = gl.id 
     JOIN sections s ON cs.section_id = s.id 
     WHERE gl.grade_number = 10 AND s.section_name = 'A' LIMIT 1),
    s.id,
    CASE 
        WHEN s.code = 'MATH01' THEN 7
        WHEN s.code = 'ENG01' THEN 6
        WHEN s.code = 'SCI01' THEN 7
        WHEN s.code = 'SS01' THEN 5
        WHEN s.code = 'HIN01' THEN 4
        WHEN s.code = 'CS01' THEN 2
        WHEN s.code = 'PE01' THEN 2
    END,
    'CBSE Class 10 Board exam preparation - intensive focus'
FROM classes c
CROSS JOIN subjects s
WHERE c.name = 'Class 10' 
  AND s.code IN ('MATH01', 'ENG01', 'SCI01', 'SS01', 'HIN01', 'CS01', 'PE01');

-- Timetable Requirements for Class 11-A (Science stream with Physics, Chemistry, Biology)
INSERT INTO timetable_requirements (class_id, section_id, subject_id, weekly_periods, notes)
SELECT 
    c.id,
    (SELECT cs.section_id FROM class_sections cs 
     JOIN grade_levels gl ON cs.grade_id = gl.id 
     JOIN sections s ON cs.section_id = s.id 
     WHERE gl.grade_number = 11 AND s.section_name = 'A' LIMIT 1),
    s.id,
    CASE 
        WHEN s.code = 'MATH01' THEN 6
        WHEN s.code = 'ENG01' THEN 4
        WHEN s.code = 'PHY01' THEN 6
        WHEN s.code = 'CHEM01' THEN 6
        WHEN s.code = 'BIO01' THEN 6
        WHEN s.code = 'CS01' THEN 2
        WHEN s.code = 'PE01' THEN 2
    END,
    'Science stream - PCB with Computer Science'
FROM classes c
CROSS JOIN subjects s
WHERE c.name = 'Class 11' 
  AND s.code IN ('MATH01', 'ENG01', 'PHY01', 'CHEM01', 'BIO01', 'CS01', 'PE01');

-- Timetable Requirements for Class 12-A (Science stream - Board exam year)
INSERT INTO timetable_requirements (class_id, section_id, subject_id, weekly_periods, notes)
SELECT 
    c.id,
    (SELECT cs.section_id FROM class_sections cs 
     JOIN grade_levels gl ON cs.grade_id = gl.id 
     JOIN sections s ON cs.section_id = s.id 
     WHERE gl.grade_number = 12 AND s.section_name = 'A' LIMIT 1),
    s.id,
    CASE 
        WHEN s.code = 'MATH01' THEN 7
        WHEN s.code = 'ENG01' THEN 5
        WHEN s.code = 'PHY01' THEN 7
        WHEN s.code = 'CHEM01' THEN 7
        WHEN s.code = 'BIO01' THEN 7
        WHEN s.code = 'CS01' THEN 2
        WHEN s.code = 'PE01' THEN 2
    END,
    'CBSE Class 12 Board exam - intensive preparation for NEET/JEE'
FROM classes c
CROSS JOIN subjects s
WHERE c.name = 'Class 12' 
  AND s.code IN ('MATH01', 'ENG01', 'PHY01', 'CHEM01', 'BIO01', 'CS01', 'PE01');

-- ============================================================================
-- PART 15: TEACHER DETAILS AND TIMETABLE DATA FOR SUBSTITUTIONS
-- ============================================================================

-- Create teacher_details entries for 6 teachers
INSERT INTO teacher_details (staff_id, employee_id, specialization, qualification, experience_years, max_periods_per_day)
SELECT 
    s.id,
    s.staff_id,
    s.department,
    s.qualifications,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.join_date))::INTEGER,
    5
FROM school_staff s
WHERE s.staff_id IN ('STF001', 'STF002', 'STF003', 'STF004', 'STF005', 'STF010')
ON CONFLICT (staff_id) DO NOTHING;

-- Link staff to teacher_details via UPDATE (if needed by your schema)
-- This assumes teacher_details has been created and we're just ensuring data consistency

-- Map teachers to subjects they can teach
-- STF001 (Rajesh Kumar) - Mathematics
INSERT INTO teacher_subject_map (teacher_details_id, subject_id)
SELECT 
    td.id,
    s.id
FROM teacher_details td
JOIN school_staff ss ON td.staff_id = ss.id
CROSS JOIN subjects s
WHERE ss.staff_id = 'STF001' AND s.code IN ('MATH01')
ON CONFLICT DO NOTHING;

-- STF002 (Priya Sharma) - English
INSERT INTO teacher_subject_map (teacher_details_id, subject_id)
SELECT 
    td.id,
    s.id
FROM teacher_details td
JOIN school_staff ss ON td.staff_id = ss.id
CROSS JOIN subjects s
WHERE ss.staff_id = 'STF002' AND s.code IN ('ENG01')
ON CONFLICT DO NOTHING;

-- STF003 (Amit Patel) - Science (Physics, Chemistry, Biology)
INSERT INTO teacher_subject_map (teacher_details_id, subject_id)
SELECT 
    td.id,
    s.id
FROM teacher_details td
JOIN school_staff ss ON td.staff_id = ss.id
CROSS JOIN subjects s
WHERE ss.staff_id = 'STF003' AND s.code IN ('SCI01', 'PHY01', 'CHEM01')
ON CONFLICT DO NOTHING;

-- STF004 (Sneha Reddy) - History/Social Studies
INSERT INTO teacher_subject_map (teacher_details_id, subject_id)
SELECT 
    td.id,
    s.id
FROM teacher_details td
JOIN school_staff ss ON td.staff_id = ss.id
CROSS JOIN subjects s
WHERE ss.staff_id = 'STF004' AND s.code IN ('SS01', 'HIST01')
ON CONFLICT DO NOTHING;

-- STF005 (Vikram Singh) - Physical Education
INSERT INTO teacher_subject_map (teacher_details_id, subject_id)
SELECT 
    td.id,
    s.id
FROM teacher_details td
JOIN school_staff ss ON td.staff_id = ss.id
CROSS JOIN subjects s
WHERE ss.staff_id = 'STF005' AND s.code IN ('PE01')
ON CONFLICT DO NOTHING;

-- STF010 (Deepa Menon) - Computer Science
INSERT INTO teacher_subject_map (teacher_details_id, subject_id)
SELECT 
    td.id,
    s.id
FROM teacher_details td
JOIN school_staff ss ON td.staff_id = ss.id
CROSS JOIN subjects s
WHERE ss.staff_id = 'STF010' AND s.code IN ('CS01')
ON CONFLICT DO NOTHING;

-- Map teachers to classes they teach
-- Get class and section IDs for Class 10-A and Class 9-A
DO $
DECLARE
    class_10_id BIGINT;
    class_9_id BIGINT;
    section_a_id BIGINT;
    teacher_rajesh_id BIGINT;
    teacher_priya_id BIGINT;
    teacher_amit_id BIGINT;
BEGIN
    -- Get class IDs
    SELECT id INTO class_10_id FROM classes WHERE name = 'Class 10' LIMIT 1;
    SELECT id INTO class_9_id FROM classes WHERE name = 'Class 9' LIMIT 1;
    
    -- Get section A ID
    SELECT id INTO section_a_id FROM sections WHERE section_name = 'A' LIMIT 1;
    
    -- Get teacher IDs
    SELECT td.id INTO teacher_rajesh_id FROM teacher_details td 
    JOIN school_staff ss ON td.staff_id = ss.id 
    WHERE ss.staff_id = 'STF001' LIMIT 1;
    
    SELECT td.id INTO teacher_priya_id FROM teacher_details td 
    JOIN school_staff ss ON td.staff_id = ss.id 
    WHERE ss.staff_id = 'STF002' LIMIT 1;
    
    SELECT td.id INTO teacher_amit_id FROM teacher_details td 
    JOIN school_staff ss ON td.staff_id = ss.id 
    WHERE ss.staff_id = 'STF003' LIMIT 1;
    
    -- Assign teachers to classes
    IF class_10_id IS NOT NULL AND section_a_id IS NOT NULL AND teacher_rajesh_id IS NOT NULL THEN
        INSERT INTO teacher_class_map (teacher_details_id, class_id, section_id)
        VALUES (teacher_rajesh_id, class_10_id, section_a_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF class_9_id IS NOT NULL AND section_a_id IS NOT NULL AND teacher_rajesh_id IS NOT NULL THEN
        INSERT INTO teacher_class_map (teacher_details_id, class_id, section_id)
        VALUES (teacher_rajesh_id, class_9_id, section_a_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF class_10_id IS NOT NULL AND section_a_id IS NOT NULL AND teacher_priya_id IS NOT NULL THEN
        INSERT INTO teacher_class_map (teacher_details_id, class_id, section_id)
        VALUES (teacher_priya_id, class_10_id, section_a_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF class_10_id IS NOT NULL AND section_a_id IS NOT NULL AND teacher_amit_id IS NOT NULL THEN
        INSERT INTO teacher_class_map (teacher_details_id, class_id, section_id)
        VALUES (teacher_amit_id, class_10_id, section_a_id)
        ON CONFLICT DO NOTHING;
    END IF;
END $;

-- Create sample timetable slots for Class 10-A and 9-A (Monday schedule)
-- This provides data for testing the substitution feature
DO $
DECLARE
    class_10_id BIGINT;
    class_9_id BIGINT;
    section_a_id BIGINT;
    subject_math_id BIGINT;
    subject_eng_id BIGINT;
    subject_sci_id BIGINT;
    teacher_rajesh_id BIGINT;
    teacher_priya_id BIGINT;
    teacher_amit_id BIGINT;
BEGIN
    -- Get IDs
    SELECT id INTO class_10_id FROM classes WHERE name = 'Class 10' LIMIT 1;
    SELECT id INTO class_9_id FROM classes WHERE name = 'Class 9' LIMIT 1;
    SELECT id INTO section_a_id FROM sections WHERE section_name = 'A' LIMIT 1;
    
    SELECT id INTO subject_math_id FROM subjects WHERE code = 'MATH01' LIMIT 1;
    SELECT id INTO subject_eng_id FROM subjects WHERE code = 'ENG01' LIMIT 1;
    SELECT id INTO subject_sci_id FROM subjects WHERE code = 'SCI01' LIMIT 1;
    
    SELECT td.id INTO teacher_rajesh_id FROM teacher_details td 
    JOIN school_staff ss ON td.staff_id = ss.id 
    WHERE ss.staff_id = 'STF001' LIMIT 1;
    
    SELECT td.id INTO teacher_priya_id FROM teacher_details td 
    JOIN school_staff ss ON td.staff_id = ss.id 
    WHERE ss.staff_id = 'STF002' LIMIT 1;
    
    SELECT td.id INTO teacher_amit_id FROM teacher_details td 
    JOIN school_staff ss ON td.staff_id = ss.id 
    WHERE ss.staff_id = 'STF003' LIMIT 1;
    
    -- Class 10-A Monday Schedule
    IF class_10_id IS NOT NULL AND section_a_id IS NOT NULL THEN
        -- Period 1: Mathematics (Rajesh Kumar)
        IF subject_math_id IS NOT NULL AND teacher_rajesh_id IS NOT NULL THEN
            INSERT INTO timetable_slots (class_id, section_id, day_of_week, period_number, subject_id, teacher_details_id, room_number)
            VALUES (class_10_id, section_a_id, 'MONDAY', 1, subject_math_id, teacher_rajesh_id, 'Room 101')
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Period 2: English (Priya Sharma)
        IF subject_eng_id IS NOT NULL AND teacher_priya_id IS NOT NULL THEN
            INSERT INTO timetable_slots (class_id, section_id, day_of_week, period_number, subject_id, teacher_details_id, room_number)
            VALUES (class_10_id, section_a_id, 'MONDAY', 2, subject_eng_id, teacher_priya_id, 'Room 102')
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Period 3: Mathematics (Rajesh Kumar)
        IF subject_math_id IS NOT NULL AND teacher_rajesh_id IS NOT NULL THEN
            INSERT INTO timetable_slots (class_id, section_id, day_of_week, period_number, subject_id, teacher_details_id, room_number)
            VALUES (class_10_id, section_a_id, 'MONDAY', 3, subject_math_id, teacher_rajesh_id, 'Room 101')
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Period 4: Science (Amit Patel)
        IF subject_sci_id IS NOT NULL AND teacher_amit_id IS NOT NULL THEN
            INSERT INTO timetable_slots (class_id, section_id, day_of_week, period_number, subject_id, teacher_details_id, room_number)
            VALUES (class_10_id, section_a_id, 'MONDAY', 4, subject_sci_id, teacher_amit_id, 'Lab 1')
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Period 5: Science (Amit Patel)
        IF subject_sci_id IS NOT NULL AND teacher_amit_id IS NOT NULL THEN
            INSERT INTO timetable_slots (class_id, section_id, day_of_week, period_number, subject_id, teacher_details_id, room_number)
            VALUES (class_10_id, section_a_id, 'MONDAY', 5, subject_sci_id, teacher_amit_id, 'Lab 1')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    -- Class 9-A Monday Schedule
    IF class_9_id IS NOT NULL AND section_a_id IS NOT NULL THEN
        -- Period 1: English (Priya Sharma)
        IF subject_eng_id IS NOT NULL AND teacher_priya_id IS NOT NULL THEN
            INSERT INTO timetable_slots (class_id, section_id, day_of_week, period_number, subject_id, teacher_details_id, room_number)
            VALUES (class_9_id, section_a_id, 'MONDAY', 1, subject_eng_id, teacher_priya_id, 'Room 201')
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Period 2: Mathematics (Rajesh Kumar)
        IF subject_math_id IS NOT NULL AND teacher_rajesh_id IS NOT NULL THEN
            INSERT INTO timetable_slots (class_id, section_id, day_of_week, period_number, subject_id, teacher_details_id, room_number)
            VALUES (class_9_id, section_a_id, 'MONDAY', 2, subject_math_id, teacher_rajesh_id, 'Room 201')
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Period 3: Science (Amit Patel)
        IF subject_sci_id IS NOT NULL AND teacher_amit_id IS NOT NULL THEN
            INSERT INTO timetable_slots (class_id, section_id, day_of_week, period_number, subject_id, teacher_details_id, room_number)
            VALUES (class_9_id, section_a_id, 'MONDAY', 3, subject_sci_id, teacher_amit_id, 'Lab 2')
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Period 4: Mathematics (Rajesh Kumar)
        IF subject_math_id IS NOT NULL AND teacher_rajesh_id IS NOT NULL THEN
            INSERT INTO timetable_slots (class_id, section_id, day_of_week, period_number, subject_id, teacher_details_id, room_number)
            VALUES (class_9_id, section_a_id, 'MONDAY', 4, subject_math_id, teacher_rajesh_id, 'Room 201')
            ON CONFLICT DO NOTHING;
        END IF;
        
        -- Period 5: Mathematics (Rajesh Kumar)
        IF subject_math_id IS NOT NULL AND teacher_rajesh_id IS NOT NULL THEN
            INSERT INTO timetable_slots (class_id, section_id, day_of_week, period_number, subject_id, teacher_details_id, room_number)
            VALUES (class_9_id, section_a_id, 'MONDAY', 5, subject_math_id, teacher_rajesh_id, 'Room 201')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $;

-- ============================================================================
-- PART 16: SUMMARY
-- ============================================================================

DO $$
DECLARE
    staff_count INTEGER;
    student_count INTEGER;
    admission_count INTEGER;
    staff_attendance_count INTEGER;
    student_attendance_count INTEGER;
    holiday_count INTEGER;
    fee_structure_count INTEGER;
    transport_route_count INTEGER;
    student_fee_assignment_count INTEGER;
    payment_schedule_count INTEGER;
    late_fee_count INTEGER;
    fee_payment_count INTEGER;
    additional_fee_count INTEGER;
    timetable_req_count INTEGER;
    teacher_details_count INTEGER;
    teacher_subject_map_count INTEGER;
    teacher_class_map_count INTEGER;
    timetable_slots_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO staff_count FROM school_staff;
    SELECT COUNT(*) INTO student_count FROM students;
    SELECT COUNT(*) INTO admission_count FROM admissions;
    SELECT COUNT(*) INTO staff_attendance_count FROM staff_attendance;
    SELECT COUNT(*) INTO student_attendance_count FROM attendance;
    SELECT COUNT(*) INTO holiday_count FROM school_holidays;
    SELECT COUNT(*) INTO fee_structure_count FROM fee_structures;
    SELECT COUNT(*) INTO transport_route_count FROM transport_routes;
    SELECT COUNT(*) INTO student_fee_assignment_count FROM student_fee_assignments;
    SELECT COUNT(*) INTO payment_schedule_count FROM payment_schedules;
    SELECT COUNT(*) INTO late_fee_count FROM late_fees;
    SELECT COUNT(*) INTO fee_payment_count FROM fee_payments;
    SELECT COUNT(*) INTO additional_fee_count FROM fees;
    SELECT COUNT(*) INTO timetable_req_count FROM timetable_requirements;
    SELECT COUNT(*) INTO teacher_details_count FROM teacher_details;
    SELECT COUNT(*) INTO teacher_subject_map_count FROM teacher_subject_map;
    SELECT COUNT(*) INTO teacher_class_map_count FROM teacher_class_map;
    SELECT COUNT(*) INTO timetable_slots_count FROM timetable_slots;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INDIAN SCHOOL DUMMY DATA INSERTION SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database Structure Fixes Applied:';
    RAISE NOTICE '  - Gender values updated to MALE/FEMALE';
    RAISE NOTICE '  - Payments table structure fixed';
    RAISE NOTICE '  - Payment schedules table fixed';
    RAISE NOTICE '  - Late fees table fixed';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Data Inserted:';
    RAISE NOTICE '  - Staff Members: %', staff_count;
    RAISE NOTICE '  - Students: %', student_count;
    RAISE NOTICE '  - Admissions: %', admission_count;
    RAISE NOTICE '  - Staff Attendance Records: %', staff_attendance_count;
    RAISE NOTICE '  - Student Attendance Records: %', student_attendance_count;
    RAISE NOTICE '  - School Holidays: %', holiday_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FEE MANAGEMENT DATA:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  - Fee Structures: %', fee_structure_count;
    RAISE NOTICE '  - Student Fee Assignments: %', student_fee_assignment_count;
    RAISE NOTICE '  - Payment Schedules (Installments): %', payment_schedule_count;
    RAISE NOTICE '  - Late Fee Rules: %', late_fee_count;
    RAISE NOTICE '  - Fee Payments Completed: %', fee_payment_count;
    RAISE NOTICE '  - Additional Fees (Exam/Event/Lab): %', additional_fee_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TIMETABLE DATA:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  - Timetable Requirements: %', timetable_req_count;
    RAISE NOTICE '  - Classes configured: 6, 7, 8, 9, 10, 11, 12 (Section A)';
    RAISE NOTICE '  - Teacher Details: %', teacher_details_count;
    RAISE NOTICE '  - Teacher-Subject Mappings: %', teacher_subject_map_count;
    RAISE NOTICE '  - Teacher-Class Mappings: %', teacher_class_map_count;
    RAISE NOTICE '  - Timetable Slots (Sample): %', timetable_slots_count;
    RAISE NOTICE '  - Sample schedules: Class 10-A and 9-A (Monday)';

    RAISE NOTICE '========================================';
    RAISE NOTICE '  - Transport Routes: %', transport_route_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All amounts are in Indian Rupees (₹)';
    RAISE NOTICE 'Dummy data insertion completed successfully!';
    RAISE NOTICE 'Teacher substitution feature is now ready to test!';
    RAISE NOTICE '========================================';
END $$;

COMMIT;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
