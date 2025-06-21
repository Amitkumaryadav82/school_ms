-- SQL Script to Insert Classes (1-12) and Sections (A-Z)
-- Date: June 20, 2025
-- Author: GitHub Copilot

-- First, ensure the tables exist
DO $$
BEGIN
    -- Create grade_levels table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'grade_levels') THEN
        CREATE TABLE grade_levels (
            id SERIAL PRIMARY KEY,
            grade_number INTEGER NOT NULL CHECK (grade_number BETWEEN 1 AND 12),
            name VARCHAR(50) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_grade_number UNIQUE (grade_number)
        );
        
        RAISE NOTICE 'Created table: grade_levels';
    ELSE
        RAISE NOTICE 'Table grade_levels already exists';
    END IF;

    -- Create sections table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sections') THEN
        CREATE TABLE sections (
            id SERIAL PRIMARY KEY,
            section_name VARCHAR(5) NOT NULL CHECK (section_name ~ '^[A-Z]$'),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_section_name UNIQUE (section_name)
        );
        
        RAISE NOTICE 'Created table: sections';
    ELSE
        RAISE NOTICE 'Table sections already exists';
    END IF;

    -- Create class_sections table to map grades to sections (creating classrooms)
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'class_sections') THEN
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
        
        RAISE NOTICE 'Created table: class_sections';
    ELSE
        RAISE NOTICE 'Table class_sections already exists';
    END IF;
END $$;

-- Insert Grade Levels (1-12)
INSERT INTO grade_levels (grade_number, name, description)
VALUES
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
ON CONFLICT (grade_number) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- Insert Sections (A-Z)
INSERT INTO sections (section_name, description)
VALUES
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
ON CONFLICT (section_name) DO UPDATE 
SET description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- Create classroom combinations (grade + section)
-- This generates all combinations of grades 1-12 and sections A-D (most common sections)
-- You can modify this to include more sections as needed
DO $$
DECLARE
    grade_rec RECORD;
    section_rec RECORD;
    room_num VARCHAR(10);
    current_academic_year VARCHAR(9) := '2025-2026';
BEGIN
    -- Loop through each grade
    FOR grade_rec IN SELECT id, grade_number FROM grade_levels ORDER BY grade_number 
    LOOP
        -- For each grade, assign sections A through D (most common)
        -- Change the WHERE clause to include more sections if needed
        FOR section_rec IN SELECT id, section_name FROM sections WHERE section_name IN ('A', 'B', 'C', 'D') ORDER BY section_name
        LOOP
            -- Generate a room number: format is <grade_number><section_name>
            -- For example: Grade 1-A = Room 1A
            room_num := grade_rec.grade_number || section_rec.section_name;
            
            -- Insert the class-section combination
            INSERT INTO class_sections (grade_id, section_id, room_number, academic_year)
            VALUES (grade_rec.id, section_rec.id, room_num, current_academic_year)
            ON CONFLICT (grade_id, section_id, academic_year) 
            DO UPDATE SET
                room_number = EXCLUDED.room_number,
                updated_at = CURRENT_TIMESTAMP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Created classroom combinations for grades 1-12 with sections A-D';
END $$;

-- Display the inserted data for verification
SELECT 
    gl.grade_number AS grade,
    s.section_name AS section,
    cs.room_number,
    cs.capacity,
    cs.academic_year
FROM 
    class_sections cs
JOIN 
    grade_levels gl ON cs.grade_id = gl.id
JOIN 
    sections s ON cs.section_id = s.id
ORDER BY 
    gl.grade_number, s.section_name;
