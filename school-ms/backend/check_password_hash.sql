-- Check the actual password hash in the database
SELECT 
    username,
    password_hash,
    LENGTH(password_hash) as hash_length,
    LEFT(password_hash, 10) as hash_prefix,
    role,
    enabled
FROM users 
WHERE username = 'admin';
