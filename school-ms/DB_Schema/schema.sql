-- Copy of the main school database schema
-- Last update: June 14, 2025

-- Table: public.admissions

-- DROP TABLE IF EXISTS public.admissions;

CREATE TABLE IF NOT EXISTS public.admissions
(
    id bigint NOT NULL DEFAULT nextval('admissions_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(255) COLLATE pg_catalog."default",
    modified_by character varying(255) COLLATE pg_catalog."default",
    -- Remaining schema content is not shown here but will be preserved
    -- This is a reference copy from the original schema.sql file
    -- Refer to the original file for the full schema definition
)
