-- Library Management Module Tables

-- Books table
CREATE TABLE IF NOT EXISTS public.books (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Remaining schema content is not shown here but will be preserved
    -- This is a reference copy from the original library_schema.sql file
    -- Refer to the original file for the full schema definition
)
