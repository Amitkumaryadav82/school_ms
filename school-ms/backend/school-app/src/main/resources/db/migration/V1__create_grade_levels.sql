-- Flyway migration: create grade_levels table
CREATE TABLE IF NOT EXISTS grade_levels (
    id SERIAL PRIMARY KEY,
    grade_number INTEGER NOT NULL CHECK (grade_number BETWEEN 1 AND 12),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_grade_number UNIQUE (grade_number)
);
