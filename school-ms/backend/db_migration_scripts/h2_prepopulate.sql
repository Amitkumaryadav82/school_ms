INSERT INTO classes (id, name) VALUES (1, 'Class 1');
INSERT INTO classes (id, name) VALUES (2, 'Class 2');
INSERT INTO classes (id, name) VALUES (3, 'Class 3');

-- Add unique constraint for subject code
ALTER TABLE subjects ADD CONSTRAINT unique_subject_code UNIQUE (code);
INSERT INTO subjects (name, code, description, max_marks, theory_marks, practical_marks) VALUES ('Mathematics', '101', 'Math subject', 100, 100, 0);
INSERT INTO subjects (name, code, description, max_marks, theory_marks, practical_marks) VALUES ('Science', '102', 'Science subject', 100, 90, 10);
INSERT INTO subjects (name, code, description, max_marks, theory_marks, practical_marks) VALUES ('English', '103', 'English subject', 100, 100, 0);
INSERT INTO subjects (name, code, description, max_marks, theory_marks, practical_marks) VALUES ('Social Studies', '104', 'Social Studies subject', 100, 100, 0);
