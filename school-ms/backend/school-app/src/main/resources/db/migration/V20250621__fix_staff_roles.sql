-- Update staff roles to ensure proper formatting
-- This migration ensures that the 'role' column in school_staff has proper values

-- First, make sure the staff_roles table has the standard entries
INSERT INTO staff_roles (name, description, is_active)
VALUES 
  ('Teacher', 'Teaching staff member', true),
  ('Principal', 'School principal', true),
  ('Admin', 'Administrative staff', true),
  ('Librarian', 'Library management', true),
  ('Management', 'School management', true),
  ('Account Officer', 'Finance department', true)
ON CONFLICT (name) DO NOTHING;

-- Update any incorrect role values in the school_staff table
-- For staff with lowercase or variant role names
UPDATE school_staff SET role = 'Teacher' WHERE lower(role) = 'teacher' AND role != 'Teacher';
UPDATE school_staff SET role = 'Principal' WHERE lower(role) = 'principal' AND role != 'Principal';
UPDATE school_staff SET role = 'Admin' WHERE lower(role) = 'admin' AND role != 'Admin';
UPDATE school_staff SET role = 'Librarian' WHERE lower(role) = 'librarian' AND role != 'Librarian';
UPDATE school_staff SET role = 'Management' WHERE lower(role) = 'management' AND role != 'Management';
UPDATE school_staff SET role = 'Account Officer' WHERE lower(role) = 'account officer' AND role != 'Account Officer';

-- Map departments to specific roles (optional, can be removed if not appropriate)
UPDATE school_staff SET role = 'Teacher' WHERE department = 'Mathematics' AND role IS NULL;
UPDATE school_staff SET role = 'Teacher' WHERE department = 'Science' AND role IS NULL;
UPDATE school_staff SET role = 'Teacher' WHERE department = 'English' AND role IS NULL;
UPDATE school_staff SET role = 'Librarian' WHERE department = 'Library' AND role IS NULL;
UPDATE school_staff SET role = 'Admin' WHERE department = 'Administration' AND role IS NULL;

-- Log the changes
INSERT INTO staff_audit_log (action_type, description, performed_by, timestamp)
VALUES ('DATABASE_MIGRATION', 'Fixed staff roles formatting', 'SYSTEM', now());
