-- Flyway migration: create class_sections table mapping grades to sections
CREATE TABLE IF NOT EXISTS class_sections (
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
