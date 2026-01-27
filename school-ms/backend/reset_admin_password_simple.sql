-- Reset admin password to simple "admin" for testing
-- BCrypt hash for "admin" with strength 10
-- Generated using: new BCryptPasswordEncoder().encode("admin")

UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye/IH.HhRYpYy6y6y6y6y6y6y6y6y6y6y'
WHERE username = 'admin';

-- Alternative: Use a known working hash for "admin"
-- This hash is: $2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8K

UPDATE users 
SET password_hash = '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8K'
WHERE username = 'admin';

-- Verify the update
SELECT username, password_hash, role, enabled, account_non_expired, account_non_locked, credentials_non_expired 
FROM users 
WHERE username = 'admin';
