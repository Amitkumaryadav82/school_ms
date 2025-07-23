
-- Migration: Add exam_id to blueprint_units and enforce uniqueness
ALTER TABLE blueprint_units DROP CONSTRAINT IF EXISTS fk_blueprint_units_exam;
ALTER TABLE blueprint_units DROP CONSTRAINT IF EXISTS fk_blueprint_units_class;
ALTER TABLE blueprint_units DROP CONSTRAINT IF EXISTS fk_blueprint_units_subject;
ALTER TABLE blueprint_units DROP CONSTRAINT IF EXISTS uc_blueprint_exam_class_subject;

ALTER TABLE blueprint_units ADD COLUMN IF NOT EXISTS exam_id BIGINT;
ALTER TABLE blueprint_units ADD CONSTRAINT fk_blueprint_units_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE;
ALTER TABLE blueprint_units ALTER COLUMN class_id SET NOT NULL;
ALTER TABLE blueprint_units ALTER COLUMN subject_id SET NOT NULL;
ALTER TABLE blueprint_units ALTER COLUMN exam_id SET NOT NULL;

ALTER TABLE blueprint_units ADD CONSTRAINT uc_blueprint_exam_class_subject UNIQUE (exam_id, class_id, subject_id, name);
