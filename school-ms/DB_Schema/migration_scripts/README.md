# Database Migration Scripts

This directory contains database migration scripts that are not part of the application's Flyway migration system. These are typically:

1. Manual migration scripts
2. One-time data fixes
3. Schema conversion scripts
4. Data cleanup scripts

## Organization

Scripts in this directory follow these naming conventions:

- `db_migration_[purpose]_[date].sql` - For general migration scripts
- `data_fix_[issue]_[date].sql` - For data cleanup and fixup scripts
- `schema_convert_[from]_to_[to]_[date].sql` - For schema conversion scripts

## Execution

Unlike Flyway migrations that run automatically, these scripts need to be executed manually by a database administrator.

### Execution Process

1. Review the script content carefully
2. Create a backup of the database before executing
3. Execute in a test environment first
4. Log the execution date and results
5. Execute in production during a maintenance window

## Script Index

- `db_migration_consolidate_staff_tables.sql` - Script for consolidating various staff tables into a single table

## Related Resources

- See `../V20250614__consolidate_staff_tables.sql` for the automated Flyway migration version of the staff tables consolidation
- See `../README.md` for information on other database schema files

Last Updated: June 14, 2025
