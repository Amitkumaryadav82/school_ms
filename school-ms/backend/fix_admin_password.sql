-- Fix admin password with proper BCrypt hash
-- Password: admin

UPDATE users 
SET password_hash = '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8K'
WHERE username = 'admin';

-- Verify the update
SELECT username, password_hash, role, enabled 
FROM users 
WHERE username = 'admin';
