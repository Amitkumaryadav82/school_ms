-- Update admin user password
-- Password: admin123
-- BCrypt hash generated with strength 10

UPDATE users 
SET password_hash = '$2a$10$rZ8qYGKmXvEQGU7YQVqMOeH8xhKGZ5vK5qYqZ5qYqZ5qYqZ5qYqZ5q'
WHERE username = 'admin';

-- Verify the update
SELECT username, password_hash, role, enabled FROM users WHERE username = 'admin';
