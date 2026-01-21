-- Cleanup legacy/unused tables that were previously mapped by JPA but never used
-- Safe to run: guarded with IF EXISTS

-- Drop tables
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS class_room CASCADE;
DROP TABLE IF EXISTS example_staff CASCADE;

-- Drop sequences if they exist (may have been created by Hibernate)
DROP SEQUENCE IF EXISTS time_slots_id_seq;
DROP SEQUENCE IF EXISTS timetable_id_seq;
DROP SEQUENCE IF EXISTS class_room_id_seq;
DROP SEQUENCE IF EXISTS example_staff_id_seq;

-- Note: Dev H2 uses separate seed tables: timetable_settings, timetable_slots, etc.
-- Those are intentionally kept. This migration only targets the unused legacy ones.
