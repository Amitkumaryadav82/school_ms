-- Dummy data for testing the School Management System
-- Run this after schema.sql and after the application has started

-- 1. Insert student record
INSERT INTO students (
    student_id, first_name, last_name, email, date_of_birth, grade, section, 
    contact_number, gender, guardian_name, guardian_contact, guardian_email, 
    status, admission_date
) VALUES (
    'S2025001', 'Student', 'One', 'student1@school.com', '2010-01-01', 
    10, 'A', '1234567890', 'MALE', 'Guardian Name', '9876543210', 
    'guardian@email.com', 'ACTIVE', CURRENT_DATE
);

-- 2. Insert attendance record
INSERT INTO attendance (student_id, date, status, check_in_time, remarks) 
SELECT id, CURRENT_DATE, 'PRESENT', CURRENT_TIME, 'Regular attendance'
FROM students 
WHERE student_id = 'S2025001';

-- 3. Insert exam and result records
INSERT INTO exams (
    name, subject, grade, exam_date, total_marks, passing_marks, exam_type
) VALUES (
    'Mid Term', 'Mathematics', 10, CURRENT_TIMESTAMP, 100, 35, 'MIDTERM'
);

INSERT INTO exam_results (exam_id, student_id, marks_obtained, remarks, status)
SELECT e.id, s.id, 75, 'Good performance', 'PASS'
FROM exams e, students s
WHERE e.name = 'Mid Term' AND s.student_id = 'S2025001';

-- 4. Insert fee and payment records
INSERT INTO fees (
    name, grade, amount, due_date, fee_type, frequency, description
) VALUES (
    'Tuition Fee', 10, 5000.00, CURRENT_DATE + INTERVAL '30 days', 
    'TUITION', 'MONTHLY', 'Monthly tuition fee for Grade 10'
);

INSERT INTO payments (
    fee_id, student_id, amount, payment_date, payment_method, 
    status, transaction_reference, remarks
)
SELECT f.id, s.id, 5000.00, CURRENT_TIMESTAMP, 'CASH', 
       'COMPLETED', 'TXN' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::INTEGER, 
       'Payment received for April 2025'
FROM fees f, students s
WHERE f.name = 'Tuition Fee' AND s.student_id = 'S2025001';

-- 5. Insert timetable record for the student's class
INSERT INTO timetable (
    class_name, section, academic_year, valid_from, valid_to, is_active
) VALUES (
    'Grade 10', 'A', '2024-2025', '2024-08-01', '2025-05-31', true
);

-- Note: Run these statements in order since they have dependencies.
-- Make sure the user "Student1" exists in the users table before running these statements.