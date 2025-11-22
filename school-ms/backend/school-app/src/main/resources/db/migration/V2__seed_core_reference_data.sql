-- Seeds grade levels and sections (idempotent)
INSERT INTO grade_levels (id,name,description) VALUES
  (1,'Grade 1','Grade 1'),
  (2,'Grade 2','Grade 2'),
  (3,'Grade 3','Grade 3'),
  (4,'Grade 4','Grade 4'),
  (5,'Grade 5','Grade 5')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id,name,description) VALUES
  (1,'A','Section A'),
  (2,'B','Section B'),
  (3,'C','Section C')
ON CONFLICT (id) DO NOTHING;

-- Link grade levels to sections
DO $$
DECLARE
  g RECORD;
  s RECORD;
BEGIN
  FOR g IN SELECT id FROM grade_levels LOOP
    FOR s IN SELECT id FROM sections LOOP
      BEGIN
        INSERT INTO class_sections(grade_level_id, section_id) VALUES (g.id, s.id);
      EXCEPTION WHEN unique_violation THEN
        -- ignore duplicates
        NULL;
      END;
    END LOOP;
  END LOOP;
END $$;