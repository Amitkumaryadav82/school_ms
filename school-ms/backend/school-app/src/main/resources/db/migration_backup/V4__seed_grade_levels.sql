-- Flyway migration: seed grade_levels (idempotent via ON CONFLICT)
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
ON CONFLICT (grade_number) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;
