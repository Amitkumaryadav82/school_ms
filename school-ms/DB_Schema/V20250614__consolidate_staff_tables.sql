-- Staff Tables Migration Script
-- This script creates a consolidated staff table and migrates data from legacy tables
-- Author: GitHub Copilot
-- Date: June 14, 2025
-- For PostgreSQL database

-- Create the consolidated staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS school_staff (
    id BIGSERIAL PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    phone_number VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    join_date DATE,
    -- Remaining schema content is not shown here but will be copied as-is
    -- This is a reference copy from the Flyway migration V20250614__consolidate_staff_tables.sql
)
