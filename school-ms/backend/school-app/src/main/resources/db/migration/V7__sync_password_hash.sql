-- Align schema with application mapping to password_hash
-- Add password_hash if missing; populate from password; enforce NOT NULL
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
UPDATE users SET password_hash = password WHERE password_hash IS NULL AND password IS NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
-- (Optional) If a legacy password column existed and you want to drop it after migration
-- DO NOT DROP automatically; uncomment after verifying:
-- ALTER TABLE users DROP COLUMN password;
