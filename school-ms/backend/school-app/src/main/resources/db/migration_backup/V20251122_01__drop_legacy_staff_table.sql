-- Drop legacy staff table after consolidation to school_staff
-- Safe to run multiple times; guarded with IF EXISTS
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS hrm_staff CASCADE;