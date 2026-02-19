# Staff Entity Migration Instructions

This document provides detailed instructions for executing the staff entity migration process from legacy entities to the consolidated entity.

## Prerequisites

Before starting the migration process, ensure that:

1. You have backed up your database
2. All code changes related to the consolidated entity have been deployed
3. You have admin access to the application

## Migration Process

### Step 1: Run the Database Migration Script

The migration script creates the consolidated table and migrates data from legacy tables. The script is already included in the Flyway migrations and will be executed automatically when the application starts.

If you need to run the script manually:

```sql
-- Run the V20250614__consolidate_staff_tables.sql script
```

### Step 2: Enable the Application Migration

The application includes a data migration process that ensures all data is properly migrated and any missing fields are updated.

To enable the migration:

1. Edit the `application.properties` file:
   ```properties
   staff.migration.enabled=true
   ```

2. Restart the application.

3. Check the logs for the migration status:
   ```
   Starting staff data migration...
   Staff data migration completed. Migrated X records.
   ```

### Step 3: Verify the Migration

To verify that the migration has been successful:

1. Access the migration status API endpoint:
   ```
   GET /api/admin/migration/staff/status
   ```

2. Check the response:
   ```json
   {
     "status": "Migration status: X/Y records migrated (HRM: A, Staff Model: B)",
     "isComplete": true
   }
   ```

3. Verify that all staff data is correctly displayed in the UI.

### Step 4: Cleanup (After Verification)

Once you have verified that the migration is complete and everything works correctly:

1. Uncomment the foreign key constraints in the migration script:
   ```sql
   ALTER TABLE school_staff
       ADD CONSTRAINT fk_school_staff_role FOREIGN KEY (role_id) REFERENCES staff_roles(id),
       ADD CONSTRAINT fk_school_staff_user FOREIGN KEY (user_id) REFERENCES users(id);
   ```

2. After a safe period (e.g., 1 month in production), you can drop the legacy tables:
   ```sql
   DROP TABLE IF EXISTS hrm_staff;
   DROP TABLE IF EXISTS staff;
   DROP TABLE IF EXISTS example_staff;
   DROP TABLE IF EXISTS consolidated_staff;
   ```

## Rollback Procedure

If you encounter issues during the migration:

1. Set `staff.migration.enabled=false` in `application.properties`

2. Restart the application

3. The application will continue using the legacy entities

4. Resolve any issues and try again

## Troubleshooting

### Issue: Duplicate staff records

**Solution:** Check for staff records with the same email or staffId across different legacy tables. Resolve the duplicates manually in the database.

### Issue: Missing data in the consolidated entity

**Solution:** Check the migration logs for errors. You can trigger a manual migration using the API:
```
POST /api/admin/migration/staff/trigger
```

### Issue: Foreign key constraint errors

**Solution:** Ensure that all referenced entities (e.g., roles, users) exist in the respective tables before adding foreign key constraints.

## Contact

For assistance with the migration process, contact:

- Technical Lead: [tech-lead@school.com](mailto:tech-lead@school.com)
- Database Administrator: [dba@school.com](mailto:dba@school.com)
