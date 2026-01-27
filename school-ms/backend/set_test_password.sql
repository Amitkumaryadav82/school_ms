-- Set a simple test password: "password"
-- This is a verified BCrypt hash for the string "password"
-- Generated with BCryptPasswordEncoder strength 10

UPDATE users 
SET password_hash = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'
WHERE username = 'admin';

-- Verify the update
SELECT username, password_hash, LENGTH(password_hash) as hash_length, role, enabled 
FROM users 
WHERE username = 'admin';
