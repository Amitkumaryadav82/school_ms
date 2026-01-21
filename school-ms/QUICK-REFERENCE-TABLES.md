# Quick Reference: Database Tables & Columns
## School Management System

**Quick lookup for table names, columns, and relationships**

---

## Table Quick Reference (45 Tables)

### Authentication & Users
| Table | Primary Key | Key Columns | Foreign Keys |
|-------|-------------|-------------|--------------|
| users | id | username, password_hash, email | - |
| roles | id | name, description | - |
| user_roles | user_id, role_id | - | users(id), roles(id) |

### Staff Management
| Table | Primary Key | Key Columns | Foreign Keys |
|-------|-------------|-------------|--------------|
| school_staff | id | staff_id, email, first_name, last_name, employment_status | staff_roles(id), teacher_details(id) |
| staff_roles | id | name, description, is_active | - |
| teacher_details | id | department, qualification, subjects_taught | - |

### Student Management
| Table | Primary Key | Key Columns | Foreign Keys |
|-------|-------------|-------------|--------------|
| students | id | student_id, email, first_name, last_name, grade, section | admissions(id) |
| admissions | id | applicant_name, email, grade_applying, status | - |

### Attendance
| Table | Primary Key | Key Columns | Foreign Keys | Unique Constraint |
|-------|-------------|-------------|--------------|-------------------|
| attendance | id | date, status, student_id | students(id) | (student_id, date) |
| staff_attendance | id | attendance_date, status, staff_id | school_staff(id) | (staff_id, attendance_date) |
| school_holidays | id | date, name, description | - | - |

### Academic Structure
| Table | Primary Key | Key Columns | Foreign Keys | Unique Constraint |
|-------|-------------|-------------|--------------|-------------------|
| grade_levels | id | grade_number, name | - | grade_number |
| sections | id | section_name, description | - | section_name |
| class_sections | id | grade_id, section_id, academic_year | grade_levels(id), sections(id) | (grade_id, section_id, academic_year) |
| courses | id | course_code, name, category | - | - |
| subjects | id | name, code | - | - |
| classes | id | name, grade | - | - |
| chapters | id | name, course_id | courses(id) | - |

### Timetable
| Table | Primary Key | Key Columns | Foreign Keys | Unique Constraint |
|-------|-------------|-------------|--------------|-------------------|
| timetable_slots | id | class_id, section_id, day_of_week, period_no | classes(id), teacher_details(id) | (class_id, section_id, day_of_week, period_no) |
| timetable_settings | id | school_name, periods_per_day | - | - |
| teacher_class_map | id | teacher_details_id, class_id, section | teacher_details(id), classes(id) | (teacher_details_id, class_id, section) |
| teacher_subject_map | id | teacher_details_id, subject_id | teacher_details(id), subjects(id) | - |

### Exams
| Table | Primary Key | Key Columns | Foreign Keys | Unique Constraint |
|-------|-------------|-------------|--------------|-------------------|
| exams | id | name, start_date, end_date | - | - |
| exam_classes | exam_id, class_id | - | exams(id), classes(id) | - |
| exam_configs | id | exam_id, config_key, config_value | exams(id) | - |
| exam_mark_summaries | id | exam_id, subject_id, student_id, total_marks | exams(id), subjects(id), students(id) | (exam_id, subject_id, student_id) |
| exam_mark_details | id | summary_id, question_format_id, marks_obtained | exam_mark_summaries(id), question_paper_format(id) | (summary_id, question_format_id) |
| question_paper_format | id | name, description | - | - |
| blueprint_units | id | name, description | - | - |
| blueprint_unit_questions | id | blueprint_unit_id, question_text | blueprint_units(id) | - |

### Fee Management
| Table | Primary Key | Key Columns | Foreign Keys |
|-------|-------------|-------------|--------------|
| fees | id | name, grade, amount, due_date, fee_type | - |
| fee_structures | id | class_grade, annual_fees, building_fees, lab_fees | - |
| fee_payments | id | student_id, amount, payment_date | students(id) |
| fee_payment_schedules | id | fee_structure_id, due_date, amount | fee_structures(id) |
| late_fees | id | fee_structure_id, days_late, penalty_amount | fee_structures(id) |
| student_fee_assignments | id | student_id, fee_structure_id | students(id), fee_structures(id) |
| payment_schedules | id | fee_structure_id, installment_number | fee_structures(id) |
| payments | id | student_id, amount, payment_date | students(id) |
| transport_routes | id | route_name, fee_amount | - |

### Communication
| Table | Primary Key | Key Columns | Foreign Keys |
|-------|-------------|-------------|--------------|
| messages | id | sender_id, recipient_id, subject, content | users(id) |
| in_app_notifications | id | user_id, message, is_read | users(id) |

### Settings & Other
| Table | Primary Key | Key Columns | Foreign Keys |
|-------|-------------|-------------|--------------|
| school_settings | id | setting_key, setting_value | - |
| employees | id | employee_id, name, department | - |
| staff_audit_log | id | staff_id, action_type, description | school_staff(id) |

---

## Critical Columns by Table

### school_staff (Most Important Table)
```sql
-- Identity
id BIGSERIAL PRIMARY KEY
staff_id VARCHAR(50) UNIQUE NOT NULL
email VARCHAR(255) UNIQUE NOT NULL

-- Personal Info
first_name VARCHAR(100) NOT NULL
middle_name VARCHAR(100)
last_name VARCHAR(100) NOT NULL
date_of_birth DATE
gender VARCHAR(20)
blood_group VARCHAR(10)

-- Contact (DUPLICATES - Keep Both)
phone VARCHAR(30)
phone_number VARCHAR(30)
address TEXT
emergency_contact VARCHAR(100)

-- Employment Dates (DUPLICATES - Keep All)
join_date DATE
joining_date DATE
date_of_joining DATE
termination_date DATE
service_end_date DATE

-- Status (DUPLICATES - Keep Both)
employment_status VARCHAR(30) DEFAULT 'ACTIVE'
is_active BOOLEAN DEFAULT TRUE
active BOOLEAN DEFAULT TRUE

-- Role & Department
role_id BIGINT FK → staff_roles(id)
role VARCHAR(50)
department VARCHAR(100)
designation VARCHAR(100)

-- Financial
basic_salary DOUBLE PRECISION
hra DOUBLE PRECISION
da DOUBLE PRECISION
pf_uan VARCHAR(50)
gratuity VARCHAR(50)

-- Relationships
user_id BIGINT
teacher_details_id BIGINT FK → teacher_details(id)

-- Audit
created_at TIMESTAMP
updated_at TIMESTAMP
```

### students
```sql
id BIGSERIAL PRIMARY KEY
student_id VARCHAR(255) UNIQUE NOT NULL
roll_number VARCHAR(50)
first_name VARCHAR(100) NOT NULL
last_name VARCHAR(100) NOT NULL
email VARCHAR(255) UNIQUE
date_of_birth DATE NOT NULL
grade INTEGER NOT NULL
section VARCHAR(50) NOT NULL
contact_number VARCHAR(30) NOT NULL
address TEXT
gender VARCHAR(20)
guardian_name VARCHAR(150) NOT NULL
guardian_contact VARCHAR(50) NOT NULL
guardian_email VARCHAR(255)
admission_id BIGINT FK → admissions(id)
status VARCHAR(30)
admission_date DATE
blood_group VARCHAR(10)
medical_conditions TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
created_by VARCHAR(100)
modified_by VARCHAR(100)
```

### users
```sql
id BIGSERIAL PRIMARY KEY
username VARCHAR(100) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL  -- Use this (not 'password')
email VARCHAR(150)
full_name VARCHAR(100)
enabled BOOLEAN DEFAULT TRUE
account_non_expired BOOLEAN DEFAULT TRUE
account_non_locked BOOLEAN DEFAULT TRUE
credentials_non_expired BOOLEAN DEFAULT TRUE
locked BOOLEAN DEFAULT FALSE
created_at TIMESTAMP
updated_at TIMESTAMP
```

### attendance
```sql
id BIGSERIAL PRIMARY KEY
student_id BIGINT NOT NULL FK → students(id)
date DATE NOT NULL
check_in_time TIME
check_out_time TIME
status VARCHAR(20) NOT NULL  -- PRESENT, ABSENT, LATE, EXCUSED
remarks TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
created_by VARCHAR(255)
modified_by VARCHAR(255)
UNIQUE (student_id, date)
```

### staff_attendance
```sql
id BIGSERIAL PRIMARY KEY
staff_id BIGINT NOT NULL FK → school_staff(id)
attendance_date DATE NOT NULL
status VARCHAR(20) NOT NULL  -- PRESENT, ABSENT, HOLIDAY, LEAVE, HALF_DAY
note TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
created_by VARCHAR(255)
modified_by VARCHAR(255)
UNIQUE (staff_id, attendance_date)
```

---

## Enum Values Reference

### EmploymentStatus (school_staff.employment_status)
- ACTIVE
- TERMINATED
- ON_LEAVE
- RETIRED

### AttendanceStatus (attendance.status)
- PRESENT
- ABSENT
- LATE
- EXCUSED

### StaffAttendanceStatus (staff_attendance.status)
- PRESENT
- ABSENT
- HOLIDAY
- LEAVE
- HALF_DAY

### AdmissionStatus (admissions.status)
- PENDING
- UNDER_REVIEW
- APPROVED
- REJECTED
- WAITLISTED
- CANCELLED
- ENROLLED

### StudentStatus (students.status)
- ACTIVE
- INACTIVE
- GRADUATED
- TRANSFERRED
- WITHDRAWN

### FeeType (fees.fee_type)
- TUITION
- EXAM
- LIBRARY
- LABORATORY
- TRANSPORTATION
- OTHER

### FeeFrequency (fees.frequency)
- ONE_TIME
- MONTHLY
- QUARTERLY
- ANNUALLY

---

## Foreign Key Relationships Map

```
users ←─── user_roles ───→ roles
  ↓
messages, in_app_notifications

grade_levels ←─── class_sections ───→ sections
  
staff_roles ←─── school_staff ───→ teacher_details
                      ↓
              staff_attendance
                      ↓
              staff_audit_log

admissions ←─── students
                   ↓
        ┌──────────┼──────────┐
        ↓          ↓          ↓
   attendance  payments  student_fee_assignments
                              ↓
                      fee_structures
                              ↓
                    ┌─────────┼─────────┐
                    ↓         ↓         ↓
            fee_payments  late_fees  payment_schedules

teacher_details ←─── teacher_class_map ───→ classes
       ↓
teacher_subject_map ───→ subjects
       ↓
timetable_slots ───→ classes

exams ←─── exam_classes ───→ classes
  ↓
exam_configs
  ↓
exam_mark_summaries ───→ subjects, students
  ↓
exam_mark_details ───→ question_paper_format

blueprint_units ←─── blueprint_unit_questions

courses ←─── chapters
```

---

## Index Reference

### Automatically Created (Primary Keys & Unique Constraints)
- All `id` columns (PRIMARY KEY)
- All UNIQUE constraints create indexes

### Manually Created Indexes

**school_staff:**
- idx_staff_id (staff_id)
- idx_email (email)
- idx_role_id (role_id)
- idx_user_id (user_id)

**students:**
- idx_students_student_id (student_id)
- idx_students_email (email)
- idx_students_grade_section (grade, section)
- idx_students_admission_id (admission_id)

**attendance:**
- idx_attendance_student_id (student_id)
- idx_attendance_date (date)

**staff_attendance:**
- idx_staff_attendance_staff_id (staff_id)
- idx_staff_attendance_date (attendance_date)

**timetable_slots:**
- idx_tslot_class_section (class_id, section_id)
- idx_tslot_teacher (teacher_details_id)
- idx_tslot_day_period (day_of_week, period_no)
- ux_tslot_teacher_timeslot (day_of_week, period_no, teacher_details_id) WHERE teacher_details_id IS NOT NULL

**courses:**
- idx_courses_department (department)
- idx_courses_teacher_id (teacher_id)

---

## Seed Data Quick Reference

### Roles (4 records)
```sql
(1, 'ADMIN', 'Administrator role')
(2, 'TEACHER', 'Teacher role')
(3, 'STUDENT', 'Student role')
(4, 'PARENT', 'Parent role')
```

### Users (2 records)
```sql
('admin', '$2a$10$Dow1b0CQpZK0s8AjtKq6uO2dQ.wc2u/.1ytY1/6YrXOvNhbbX6n1K', 'admin@schoolms.com')
('admin1', '$2a$10$1bYp1SiyNLKn.z2QL8Iceu8Yw2GxWfZpXeQJcDjuCwaBlDg9uVkie', 'admin1@schoolms.com')
```

### Grade Levels (12 records)
```
Grade 1 through Grade 12
```

### Sections (26 records)
```
A through Z
```

### Class Sections (48 records)
```
Grades 1-12 × Sections A-D for academic year 2025-2026
```

### Staff Roles (6 records)
```
Teacher, Principal, Admin, Librarian, Management, Account Officer
```

---

## Table Creation Order (Dependency-Based)

**Level 1 (No Dependencies):**
1. roles
2. users
3. grade_levels
4. sections
5. staff_roles
6. school_holidays
7. school_settings
8. subjects
9. classes

**Level 2:**
10. user_roles
11. class_sections
12. teacher_details
13. admissions
14. courses
15. chapters

**Level 3:**
16. school_staff
17. students
18. fee_structures
19. exams
20. timetable_settings

**Level 4:**
21. attendance
22. staff_attendance
23. teacher_class_map
24. teacher_subject_map
25. timetable_slots
26. exam_classes
27. exam_configs
28. question_paper_format
29. blueprint_units

**Level 5:**
30. exam_mark_summaries
31. exam_mark_details
32. blueprint_unit_questions
33. fees
34. fee_payments
35. fee_payment_schedules
36. late_fees
37. payment_schedules
38. student_fee_assignments
39. payments
40. transport_routes
41. messages
42. in_app_notifications
43. employees
44. staff_audit_log

---

## Common Queries Reference

### Get all active staff
```sql
SELECT * FROM school_staff 
WHERE employment_status = 'ACTIVE' 
  AND is_active = true;
```

### Get student attendance for a date
```sql
SELECT s.student_id, s.first_name, s.last_name, a.status
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id AND a.date = '2026-01-18'
WHERE s.status = 'ACTIVE';
```

### Get staff attendance for a date
```sql
SELECT ss.staff_id, ss.first_name, ss.last_name, sa.status
FROM school_staff ss
LEFT JOIN staff_attendance sa ON ss.id = sa.staff_id AND sa.attendance_date = '2026-01-18'
WHERE ss.employment_status = 'ACTIVE';
```

### Get class sections for a grade
```sql
SELECT g.name as grade, s.section_name, cs.room_number
FROM class_sections cs
JOIN grade_levels g ON cs.grade_id = g.id
JOIN sections s ON cs.section_id = s.id
WHERE g.grade_number = 10
  AND cs.academic_year = '2025-2026';
```

### Get teacher timetable
```sql
SELECT ts.day_of_week, ts.period_no, c.name as class_name, s.name as subject
FROM timetable_slots ts
JOIN classes c ON ts.class_id = c.id
JOIN subjects s ON ts.subject_id = s.id
WHERE ts.teacher_details_id = 1
ORDER BY ts.day_of_week, ts.period_no;
```

---

**Document End**

*Quick reference for developers and database administrators*
