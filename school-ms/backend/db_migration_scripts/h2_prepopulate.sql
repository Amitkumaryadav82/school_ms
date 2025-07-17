-- Prepopulate Classes for H2
INSERT INTO classes (id, name) VALUES (1, 'Class 1');
INSERT INTO classes (id, name) VALUES (2, 'Class 2');
INSERT INTO classes (id, name) VALUES (3, 'Class 3');

-- Prepopulate Subjects for H2
INSERT INTO subjects (id, name, code, description, max_marks, theory_marks, practical_marks) VALUES (1, 'Mathematics', '101', 'Math subject', 100, 100, 0);
INSERT INTO subjects (id, name, code, description, max_marks, theory_marks, practical_marks) VALUES (2, 'Science', '102', 'Science subject', 100, 90, 10);
INSERT INTO subjects (id, name, code, description, max_marks, theory_marks, practical_marks) VALUES (3, 'English', '103', 'English subject', 100, 100, 0);
INSERT INTO subjects (id, name, code, description, max_marks, theory_marks, practical_marks) VALUES (4, 'Social Studies', '104', 'Social Studies subject', 100, 100, 0);
