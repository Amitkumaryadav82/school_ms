# Employment Status vs. isActive Usage Guide

## Overview

This document provides guidance on the transition from using `isActive` to `employmentStatus` for determining a staff member's active status in the School Management System.

## Current Implementation

The system is currently in a transition phase where:

1. `employmentStatus` (from the `employment_status` column) is now the primary source of truth for a staff member's status.
2. `isActive` (`is_active` column) is maintained for backward compatibility.
3. Our code synchronizes these two fields to ensure consistency.

## How to Use Staff Status in Your Code

### ✅ Recommended Approach

```java
// Checking if a staff is active
if (staff.getEmploymentStatus() == EmploymentStatus.ACTIVE) {
    // Staff is active
}

// Filtering for active staff in repositories
List<Staff> activeStaff = staffRepository.findByEmploymentStatus(EmploymentStatus.ACTIVE);

// Setting a staff as inactive/terminated
staff.setEmploymentStatus(EmploymentStatus.TERMINATED);
```

### ⛔ Deprecated Approach (Avoid)

```java
// Don't use these patterns anymore
if (staff.getIsActive()) { ... }
List<Staff> activeStaff = staffRepository.findByIsActiveTrue();
staff.setIsActive(false);
```

## Benefits of Using Employment Status

1. **More Semantic Information**: `employmentStatus` provides specific information about why a staff member is active or inactive (ACTIVE, TERMINATED, ON_LEAVE, RETIRED, etc.).
2. **Consistency**: Using a single source of truth reduces the risk of inconsistent states.
3. **Better Integration**: Holiday attendance and other features now correctly use `employmentStatus` for determining active staff.

## Database Impact

The `is_active` column is still present in the database for backward compatibility, but all code should now be using the `employment_status` column as the primary indicator.

## Migration Fixes

If you encounter issues with staff not appearing correctly in reports or attendance records, you can use the following endpoints to fix data inconsistencies:

- `POST /api/debug/direct-fixes/fix-employment-status`: Fixes inconsistent status between `is_active` and `employment_status`
- `POST /api/debug/direct-fixes/fix-holiday-attendance?date=YYYY-MM-DD`: Fixes holiday attendance for specific dates

## Future Work

In a future update, we plan to completely remove the `is_active` column and update all client code to exclusively use `employment_status`.
