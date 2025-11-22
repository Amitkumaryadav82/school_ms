-- Flyway migration: create core auth tables (users, roles, user_roles) and seed base roles.
-- Idempotent: uses IF NOT EXISTS and ON CONFLICT DO NOTHING so it can run safely
-- even if a manual bootstrap already created these tables or rows.

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150),
    enabled BOOLEAN DEFAULT TRUE,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Seed base roles (admin + standard user)
INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER')
ON CONFLICT (name) DO NOTHING;

-- (Optional) Seed an initial admin user if none exists.
-- Requires a pre-generated bcrypt hash; replace placeholder before enabling.
-- Uncomment and supply secure hash only if desired.
-- INSERT INTO users (username, password_hash, email)
-- VALUES ('admin', '$2a$10$REPLACE_WITH_BCRYPT_HASH', 'admin@example.com')
-- ON CONFLICT (username) DO NOTHING;
