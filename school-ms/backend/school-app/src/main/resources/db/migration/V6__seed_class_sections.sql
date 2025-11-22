-- Flyway migration: seed class_sections combinations for sections A-D and grades 1-12 (idempotent)
INSERT INTO class_sections (grade_id, section_id, room_number, academic_year)
SELECT g.id, s.id, CONCAT(g.grade_number, s.section_name), '2025-2026'
FROM grade_levels g
JOIN sections s ON s.section_name IN ('A','B','C','D')
ON CONFLICT (grade_id, section_id, academic_year) DO UPDATE SET
    room_number = EXCLUDED.room_number,
    updated_at = CURRENT_TIMESTAMP;
