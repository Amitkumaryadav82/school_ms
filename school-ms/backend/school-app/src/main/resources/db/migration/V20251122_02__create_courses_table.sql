-- Create courses table for ConsolidatedCourse entity
-- Safe for repeated runs via IF NOT EXISTS
CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    department VARCHAR(255),
    teacher_id BIGINT,
    teacher_name VARCHAR(255),
    credits INT,
    capacity INT,
    enrolled INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Optional: basic index to speed department queries
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);

-- Seed a couple of sample courses only if table currently empty
INSERT INTO courses (name, department, teacher_id, teacher_name, credits, capacity, enrolled, created_at, updated_at)
SELECT 'Mathematics 101', 'Mathematics', 1, NULL, 3, 40, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses);

INSERT INTO courses (name, department, teacher_id, teacher_name, credits, capacity, enrolled, created_at, updated_at)
SELECT 'English Literature', 'Arts', 2, NULL, 4, 35, 0, NOW(), NOW()
WHERE (SELECT COUNT(*) FROM courses) = 1;
