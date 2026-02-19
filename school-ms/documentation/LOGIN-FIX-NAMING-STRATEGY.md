# Login Fix - Hibernate Naming Strategy Issue

## Problem

Login was failing with the following error:
```
ERROR: column user0_.accountnonexpired does not exist
Hint: Perhaps you meant to reference the column "user0_.account_non_expired".
```

## Root Cause

The issue was a **Hibernate naming strategy mismatch**:

1. **Database columns** use snake_case naming:
   - `account_non_expired`
   - `account_non_locked`
   - `credentials_non_expired`
   - `enabled`

2. **JPA Entity (User.java)** had correct `@Column` annotations with snake_case names

3. **application.properties** was configured with:
   ```properties
   spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
   ```
   
   This strategy was **ignoring the @Column annotations** and generating camelCase column names instead.

## Solution

**Fixed in**: `school-ms/backend/school-app/src/main/resources/application.properties`

**Changes**:
1. Commented out the problematic physical naming strategy
2. Changed implicit naming strategy to JPA compliant version

```properties
# Before:
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
spring.jpa.hibernate.naming.implicit-strategy=org.hibernate.boot.model.naming.ImplicitNamingStrategyLegacyJpaImpl

# After:
# Use Spring Boot default naming strategy which respects @Column annotations
# spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
spring.jpa.hibernate.naming.implicit-strategy=org.hibernate.boot.model.naming.ImplicitNamingStrategyJpaCompliantImpl
```

## How This Fix Works

By removing the `PhysicalNamingStrategyStandardImpl`, Hibernate now:
1. **Respects the @Column annotations** in the User entity
2. Uses the explicit column names defined: `account_non_expired`, `account_non_locked`, etc.
3. Matches the actual database schema

## Next Steps

1. **Rebuild the backend**:
   ```cmd
   cd school-ms\backend\school-app
   mvn package -DskipTests
   ```

2. **Restart the application**:
   ```cmd
   java -jar target\school-app-1.0.0.jar
   ```

3. **Test login** with credentials:
   - Username: `admin`
   - Password: `ChangeMe_Initial1!`

## Verification

After restart, the login should work correctly. Check the logs for:
- No more "column does not exist" errors
- Successful authentication messages
- JWT token generation

## Related Files

- `school-ms/backend/school-app/src/main/java/com/school/security/User.java` - Entity with correct @Column annotations
- `school-ms/consolidated_school_database.sql` - Database schema with snake_case columns
- `school-ms/backend/school-app/src/main/resources/application.properties` - Fixed naming strategy
