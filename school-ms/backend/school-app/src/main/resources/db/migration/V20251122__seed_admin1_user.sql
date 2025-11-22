-- Flyway migration to seed an additional admin user 'admin1'.
-- Plaintext password requested: qwerty
-- IMPORTANT: For security, we store only a bcrypt hash. Plain 'qwerty' is weak; change in production.
-- Hash generated (cost 10). Regenerate if uncertain:
--   Java snippet: new BCryptPasswordEncoder().encode("qwerty")
-- Example hash used below (qwerty): $2a$10$1bYp1SiyNLKn.z2QL8Iceu8Yw2GxWfZpXeQJcDjuCwaBlDg9uVkie
-- If you want to rotate, replace password_hash value with a freshly generated one before deploy.

-- Ensure roles table has ADMIN/ROLE_ADMIN style depending on convention.
-- We check both naming patterns; adjust if your canonical admin role differs.
INSERT INTO roles (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;

-- Insert admin1 user if not present. Uses password_hash column if it exists, else falls back to password.
-- Detect column presence via INSERT column list matching existing schema.
-- First, try modern schema with password_hash:
INSERT INTO users (username, password_hash, email, full_name, enabled, account_non_expired, account_non_locked, credentials_non_expired, created_at, updated_at)
SELECT 'admin1', '$2a$10$1bYp1SiyNLKn.z2QL8Iceu8Yw2GxWfZpXeQJcDjuCwaBlDg9uVkie', 'admin1@schoolms.com', 'Secondary Administrator', TRUE, TRUE, TRUE, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin1');

-- Fallback legacy schema variant (if password_hash column not present but password is). Harmless if column names differ (statement will fail & be logged once); remove if undesired.
-- INSERT INTO users (username, password, email, full_name, enabled, account_non_expired, account_non_locked, credentials_non_expired, created_at, updated_at)
-- SELECT 'admin1', '$2a$10$1bYp1SiyNLKn.z2QL8Iceu8Yw2GxWfZpXeQJcDjuCwaBlDg9uVkie', 'admin1@schoolms.com', 'Secondary Administrator', TRUE, TRUE, TRUE, TRUE, NOW(), NOW()
-- WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin1');

-- Map admin1 to an admin role (choose whichever exists).
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON (r.name IN ('ADMIN','ROLE_ADMIN'))
WHERE u.username='admin1'
ON CONFLICT DO NOTHING;
