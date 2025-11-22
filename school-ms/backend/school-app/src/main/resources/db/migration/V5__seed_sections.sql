-- Flyway migration: seed sections A-Z (idempotent)
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
ON CONFLICT (section_name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;
