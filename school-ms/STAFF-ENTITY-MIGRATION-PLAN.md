# Staff Entity Migration Plan

## Overview

This document outlines the plan for consolidating multiple `Staff` entities into a single entity in the `com.school.core.model` package. The goal is to simplify the codebase, eliminate duplication, and improve maintainability.

## Current State

Currently, we have multiple `Staff` entities spread across different packages:

1. `com.school.hrm.entity.Staff` - Maps to `hrm_staff` table
2. `com.school.staff.model.Staff` - Maps to `staff` table
3. `com.example.schoolms.model.Staff` - Maps to `example_staff` table (deprecated)
4. `com.school.staff.model.ConsolidatedStaff` - Maps to `consolidated_staff` table (transitional)

This has led to duplication of code, increased complexity, and potential conflicts due to multiple entities mapping to similar data.

## Target State

After the migration, we will have a single `Staff` entity:

- `com.school.core.model.Staff` - Maps to `school_staff` table

All other `Staff` entities will be deprecated and eventually removed.

## Migration Process

### Phase 1: Preparation (Complete)

1. ✅ Added `@Deprecated` annotation to legacy `Staff` entities
2. ✅ Created `StaffEntityAdapter` to facilitate conversion between entities
3. ✅ Created `StaffMigrationService` for data migration
4. ✅ Created database migration script to consolidate all staff tables

### Phase 2: Code Migration

1. Update all references to legacy `Staff` entities to use the consolidated entity
2. Modify controllers, services, and repositories to work with the consolidated entity
3. Use the `StaffEntityAdapter` for backward compatibility where needed
4. Run tests to ensure all functionality still works

### Phase 3: Data Migration

1. Execute the database migration script to create the consolidated table
2. Use `StaffMigrationService` to migrate data from legacy tables to the consolidated table
3. Validate data integrity after migration
4. Create backup of legacy tables before proceeding to Phase 4

### Phase 4: Cleanup (Future)

1. Remove legacy `Staff` entities and their repositories
2. Remove data migration code
3. Drop legacy tables from the database

## Entities and Fields Mapping

| Legacy Entity | Consolidated Entity | Table |
|---------------|---------------------|-------|
| com.school.hrm.entity.Staff | com.school.core.model.Staff | school_staff |
| com.school.staff.model.Staff | com.school.core.model.Staff | school_staff |
| com.example.schoolms.model.Staff | com.school.core.model.Staff | school_staff |

## Database Migration

The database migration script (`V20250614__consolidate_staff_tables.sql`) performs the following:

1. Creates the `school_staff` table if it doesn't exist
2. Migrates data from `hrm_staff` table
3. Migrates data from `staff` table
4. Migrates data from `example_staff` table
5. Migrates data from `consolidated_staff` table
6. Updates fields for consistency
7. Comments out dropping legacy tables until migration is complete

## Code Adaptation

For legacy code that still depends on the old entities, we've created a `StaffEntityAdapter` class that handles conversion between legacy entities and the consolidated entity. This allows for a gradual migration without breaking existing functionality.

## Testing

1. Unit tests will be updated to use the consolidated entity
2. Integration tests will verify that all CRUD operations work with the consolidated entity
3. End-to-end tests will ensure that the application works as expected after migration

## Rollback Plan

If issues are encountered during migration:

1. Keep legacy tables intact (they are not dropped by the migration script)
2. Revert code changes related to entity consolidation
3. Disable migration service to prevent automatic data migration

## Timeline

- Phase 1: June 14, 2025 (Complete)
- Phase 2: June 14-20, 2025
- Phase 3: June 21-25, 2025
- Phase 4: July 2025 (After thorough testing)

## Resources

- JIRA Issue: SCHOOL-XXX
- Pull Request: #XXX
- Database Migration Script: `V20250614__consolidate_staff_tables.sql`
- Entity Adapter: `StaffEntityAdapter.java`
