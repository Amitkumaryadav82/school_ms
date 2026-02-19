# Transport Route Column Mismatch Fix

## Problem

Application was throwing SQL error when accessing transport routes:

```
ERROR: column transportr0_.route_description does not exist
Position: 120
```

## Root Cause

**Database Schema vs Entity Mismatch:**

- **Database table** (`transport_routes`): Has column named `description`
- **Java Entity** (`TransportRoute.java`): Expected column named `route_description`

This mismatch occurred because the consolidated database script uses `description` while the entity was configured for `route_description`.

## Solution Applied

Fixed the `@Column` annotation in the TransportRoute entity to match the actual database column name:

**File:** `school-ms/backend/school-app/src/main/java/com/school/fee/model/TransportRoute.java`

**Change:**
```java
// Before (incorrect)
@Column(name = "route_description")
private String routeDescription;

// After (correct)
@Column(name = "description")
private String routeDescription;
```

## Database Schema Reference

From `consolidated_school_database.sql`:

```sql
CREATE TABLE transport_routes (
    id BIGSERIAL PRIMARY KEY,
    route_name VARCHAR(255) NOT NULL,
    route_number VARCHAR(50),
    fee_amount NUMERIC(15,2) NOT NULL,
    description TEXT,                    -- ← Column name is "description"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255)
);
```

## Build Status

✅ **Fixed and rebuilt successfully**
- Build completed: 2026-01-28T14:55:00+05:30
- JAR location: `school-ms/backend/school-app/target/school-app-1.0.0.jar`
- Build time: 53.457 seconds

## Next Steps

1. **Restart the application** to apply the fix:
   ```powershell
   # Stop the current running application
   # Then start with the new JAR
   java -jar school-ms/backend/school-app/target/school-app-1.0.0.jar
   ```

2. **Verify the fix:**
   - Login to the application
   - Navigate to Fee Management → Transport Routes
   - Should load without SQL errors

## Prevention

This type of issue can be prevented by:

1. **Consistent naming:** Ensure entity `@Column` annotations match database column names
2. **Integration tests:** Add tests that verify entity-database mapping
3. **Schema validation:** Enable Hibernate schema validation in development:
   ```properties
   spring.jpa.hibernate.ddl-auto=validate
   ```

## Related Files

- Entity: `school-ms/backend/school-app/src/main/java/com/school/fee/model/TransportRoute.java`
- Database: `school-ms/consolidated_school_database.sql` (line 713-725)
- Controller: `school-ms/backend/school-app/src/main/java/com/school/fee/controller/TransportRouteController.java`
- Service: `school-ms/backend/school-app/src/main/java/com/school/fee/service/TransportRouteService.java`
