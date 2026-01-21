-- Add auditing columns expected by Auditable superclass
-- Safe to run multiple times (IF NOT EXISTS)
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS modified_by VARCHAR(255);

-- Optional indexes to support queries / ordering
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relname='idx_users_created_at' AND n.nspname='public') THEN
    CREATE INDEX idx_users_created_at ON users(created_at);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relname='idx_users_updated_at' AND n.nspname='public') THEN
    CREATE INDEX idx_users_updated_at ON users(updated_at);
  END IF;
END$$;
