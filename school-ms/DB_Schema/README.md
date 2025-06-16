# Database Schema and Migration Files

This directory contains all database schema definitions, migration scripts, and seed data for the School Management System.

## Files

- **schema.sql**: Main database schema with all table definitions
- **library_schema.sql**: Schema specific to the library management module
- **question_wise_marks.sql**: Schema for the question-wise marking system
- **insert_staff_roles.sql**: Seed data for staff roles
- **dummy_data.sql**: Test data for development and testing environments
- **V20250614__consolidate_staff_tables.sql**: Flyway migration script for staff tables consolidation

## Directories

- **migration_scripts/**: Contains manual database migration scripts and data fixes
  - See `migration_scripts/README.md` for details on the scripts in this directory

## Usage

### For Development

1. Create a new database for the School Management System
2. Run `schema.sql` to create the base tables
3. Run additional module-specific schema files (`library_schema.sql`, etc.)
4. Run seed data scripts (`insert_staff_roles.sql`)
5. Optionally run `dummy_data.sql` for test data

### For Production Deployment

1. Use Flyway migrations in the application for schema updates
2. Run only seed data scripts that are required for production

### For Schema Changes

1. Always create a proper migration script
2. Update the corresponding schema file in this directory
3. Document changes in the migration script

## Migration Scripts

Migration scripts follow the naming convention:

- Flyway migrations: `V{YYYYMMDD}__{description}.sql`
- Manual migrations: `db_migration_{description}.sql`

## Notes

- All scripts are designed for PostgreSQL database
- Scripts are idempotent when possible (using IF NOT EXISTS clauses)
- Keep this directory updated whenever changes are made to the database schema

Last Updated: June 14, 2025
