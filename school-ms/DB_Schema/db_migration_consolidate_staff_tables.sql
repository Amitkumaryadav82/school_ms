-- Migration script to rename tables and update column names
-- This should be executed during a maintenance window

-- First, back up the existing tables
CREATE TABLE staff_backup AS SELECT * FROM staff;
CREATE TABLE hrm_staff_backup AS SELECT * FROM hrm_staff;

-- Create the new consolidated table structure
CREATE TABLE school_staff (
    id SERIAL PRIMARY KEY,
    -- Remaining schema content is not shown here but will be preserved
    -- This is a reference copy from the original consolidate_staff_tables.sql file
    -- Refer to the original file for the full schema definition
)
