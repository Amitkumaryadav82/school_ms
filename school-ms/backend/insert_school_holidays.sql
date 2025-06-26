-- Insert into the existing school_holidays table
-- Note: This script assumes the school_holidays table already exists
-- The table structure in the database is:
--   id bigint NOT NULL,
--   created_at timestamp(6) without time zone NOT NULL,
--   updated_at timestamp(6) without time zone NOT NULL,
--   date date NOT NULL,
--   description character varying(255),
--   name character varying(255) NOT NULL,
--   type character varying(255) NOT NULL

-- Note: The table already has a primary key and necessary constraints
-- We don't need to create triggers or indexes as they should exist in the main schema

-- Insert Uttar Pradesh holidays for 2025
INSERT INTO public.school_holidays (date, name, description, type, created_at, updated_at)
VALUES 
    -- January
    ('2025-01-01', 'New Year''s Day', 'First day of the year', 'NATIONAL_HOLIDAY', NOW(), NOW()),
    ('2025-01-14', 'Imam Ali''s Birthday', 'Birth anniversary of Imam Ali', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    ('2025-01-26', 'Republic Day', 'Day when Constitution of India came into effect', 'NATIONAL_HOLIDAY', NOW(), NOW()),
    
    -- February
    ('2025-02-26', 'Maha Shivratri', 'A festival dedicated to Lord Shiva', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    
    -- March
    ('2025-03-14', 'Holi', 'Festival of colors', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    ('2025-03-31', 'Id-ul-Fitr', 'Marks the end of Ramadan', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    
    -- April
    ('2025-04-01', 'Bank Holiday', 'Annual bank closing of accounts', 'OTHER', NOW(), NOW()),
    ('2025-04-06', 'Ram Navami', 'Celebrates birth of Lord Rama', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    ('2025-04-10', 'Mahavir Jayanti', 'Birth anniversary of Lord Mahavira', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    ('2025-04-14', 'Dr. Ambedkar Jayanti', 'Birth anniversary of Dr. B.R. Ambedkar', 'NATIONAL_HOLIDAY', NOW(), NOW()),
    ('2025-04-18', 'Good Friday', 'Commemorates crucifixion of Jesus Christ', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    
    -- May
    ('2025-05-12', 'Buddha Purnima', 'Celebrates birth of Gautama Buddha', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    
    -- June
    ('2025-06-07', 'Id-ul-Zuha', 'Festival of sacrifice (Bakrid)', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    ('2025-06-26', 'School Foundation Day', 'Annual school foundation day', 'SCHOOL_FUNCTION', NOW(), NOW()),
    
    -- July
    ('2025-07-06', 'Muharram', 'Islamic New Year and commemoration of Ashura', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    
    -- August
    ('2025-08-09', 'Raksha Bandhan', 'Celebrates bond between brothers and sisters', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    ('2025-08-15', 'Independence Day', 'India''s independence from British rule', 'NATIONAL_HOLIDAY', NOW(), NOW()),
    ('2025-08-16', 'Janmashtami', 'Birth anniversary of Lord Krishna', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    
    -- September
    ('2025-09-05', 'Id-E-Milad', 'Birth anniversary of Prophet Muhammad', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    
    -- October
    ('2025-10-01', 'Maha Navami', 'Ninth day of Durga Puja', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    ('2025-10-02', 'Mahatma Gandhi Jayanti', 'Birth anniversary of Mahatma Gandhi', 'NATIONAL_HOLIDAY', NOW(), NOW()),
    ('2025-10-03', 'Vijaya Dashami', 'Celebrates victory of good over evil (Dussehra)', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    ('2025-10-20', 'Diwali', 'Festival of lights', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    ('2025-10-21', 'Diwali Holiday', 'Extended holiday for Diwali celebrations', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    ('2025-10-23', 'Bhai Dooj', 'Celebrates brother-sister relationship after Diwali', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    
    -- November
    ('2025-11-05', 'Guru Nanak Jayanti', 'Birth anniversary of Guru Nanak', 'RELIGIOUS_HOLIDAY', NOW(), NOW()),
    
    -- December
    ('2025-12-25', 'Christmas', 'Christmas Day celebration', 'RELIGIOUS_HOLIDAY', NOW(), NOW())
ON CONFLICT (date) DO NOTHING;
