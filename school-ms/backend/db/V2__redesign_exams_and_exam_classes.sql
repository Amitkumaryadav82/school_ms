-- Migration: Redesign exams table and add exam_classes join table

-- Drop old table if exists (be careful in production!)
DROP TABLE IF EXISTS exam_classes;
DROP TABLE IF EXISTS exams;

CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exam_classes (
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (exam_id, class_id)
);
