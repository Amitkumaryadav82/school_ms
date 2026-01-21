-- Ensures that the role column in school_staff has proper values
-- This will update any roles that may have been stored in uppercase with underscores
-- to their proper display format (e.g. TEACHER -> Teacher)

-- Update Teacher roles
UPDATE school_staff 
SET role = 'Teacher' 
WHERE role = 'TEACHER';

-- Update Librarian roles
UPDATE school_staff 
SET role = 'Librarian' 
WHERE role = 'LIBRARIAN';

-- Update Admin roles
UPDATE school_staff 
SET role = 'Admin' 
WHERE role = 'ADMIN';

-- Update Principal roles
UPDATE school_staff 
SET role = 'Principal' 
WHERE role = 'PRINCIPAL';

-- Update Management roles
UPDATE school_staff 
SET role = 'Management' 
WHERE role = 'MANAGEMENT';

-- Update Account Officer roles
UPDATE school_staff 
SET role = 'Account Officer' 
WHERE role = 'ACCOUNT_OFFICER';

-- Set default role for any null values
UPDATE school_staff 
SET role = 'Staff' 
WHERE role IS NULL;
