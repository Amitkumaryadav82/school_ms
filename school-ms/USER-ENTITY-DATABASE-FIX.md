# User Entity Database Column Mapping Fix

## Issue
Login was failing with SQL error:
```
ERROR: column user0_.accountnonexpired does not exist
Hint: Perhaps you meant to reference the column "user0_.account_non_expired".
```

## Root Cause
The User entity had camelCase field names but the database uses snake_case column names. Additionally, the `role` column was missing from the users table.

## Changes Made

### 1. User.java Entity
Added `@Column` annotations to map snake_case database columns:
- `accountNonExpired` → `account_non_expired`
- `accountNonLocked` → `account_non_locked`
- `credentialsNonExpired` → `credentials_non_expired`

### 2. Database Schema (consolidated_school_database.sql)
Added `role` column to users table:
```sql
role VARCHAR(50) DEFAULT 'ADMIN'
```

Updated both user INSERT statements to include role='ADMIN'.

### 3. Migration Script
Created `add_role_column.sql` to add the role column to existing database.

## Next Steps

1. **Run the migration script** to add the role column:
   ```bash
   psql -U postgres -d school_db -p 5435 -f school-ms/backend/add_role_column.sql
   ```
   When prompted for password, enter: `admin`

2. **Rebuild the backend**:
   ```bash
   cd school-ms/backend/school-app
   mvn package -DskipTests
   ```

3. **Restart the application**:
   ```bash
   java -jar target/school-app-1.0.0.jar
   ```

4. **Test login** with:
   - Username: `admin`
   - Password: `ChangeMe_Initial1!`

## Files Modified
- `school-ms/backend/school-app/src/main/java/com/school/security/User.java`
- `school-ms/consolidated_school_database.sql`
- `school-ms/backend/add_role_column.sql` (new)
