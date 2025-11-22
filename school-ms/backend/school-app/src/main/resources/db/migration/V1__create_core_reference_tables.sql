-- Creates core reference tables (idempotent)
CREATE TABLE IF NOT EXISTS grade_levels (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS sections (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS class_sections (
  id BIGSERIAL PRIMARY KEY,
  grade_level_id BIGINT NOT NULL REFERENCES grade_levels(id) ON DELETE CASCADE,
  section_id BIGINT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  UNIQUE(grade_level_id, section_id)
);