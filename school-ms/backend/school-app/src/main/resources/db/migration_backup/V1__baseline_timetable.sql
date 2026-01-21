-- Baseline constraints and indexes for production safety
-- Unique: one slot per class/section/day/period
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ux_tslot_class_section_day_period'
  ) THEN
    ALTER TABLE timetable_slots
    ADD CONSTRAINT ux_tslot_class_section_day_period
      UNIQUE (class_id, section_id, day_of_week, period_no);
  END IF;
END $$;

-- Prevent teacher double-booking in the same day/period (when teacher is set)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'ux_tslot_teacher_timeslot'
  ) THEN
    CREATE UNIQUE INDEX ux_tslot_teacher_timeslot
      ON timetable_slots(day_of_week, period_no, teacher_details_id)
      WHERE teacher_details_id IS NOT NULL;
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS ix_tslot_class_section ON timetable_slots(class_id, section_id);
CREATE INDEX IF NOT EXISTS ix_tslot_teacher ON timetable_slots(teacher_details_id);
CREATE INDEX IF NOT EXISTS ix_tslot_day_period ON timetable_slots(day_of_week, period_no);
