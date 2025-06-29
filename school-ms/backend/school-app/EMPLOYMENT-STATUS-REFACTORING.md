# Employment Status Refactoring

## Overview
This document outlines the changes made to the staff status management in the School Management System application. We've refactored the system to use only `employment_status` instead of relying on both `employment_status` and `is_active` columns.

## Changes Made

### Database Changes
- The system now uses `employment_status = 'ACTIVE'` as the sole indicator of an active staff member
- A migration script (`V2025_06_29__update_employment_status.sql`) ensures data consistency:
  - Sets `employment_status = 'ACTIVE'` for all records with `is_active = true`
  - Sets `employment_status = 'TERMINATED'` for all records with `is_active = false`

### Code Changes
1. Repository Layer:
   - Updated `findAllActiveStaffWithRole()` to filter on `employmentStatus = EmploymentStatus.ACTIVE`
   - Updated `findByIsActiveTrue()` to use a query filtering on `employmentStatus = EmploymentStatus.ACTIVE`

2. Service Layer:
   - No changes required as services were already using the repository methods

3. New Fix Methods:
   - Added `fixEmploymentStatus()` in `DirectFixController` to fix inconsistent employment statuses
   - This helps migrate any records with incorrect status combinations

## Benefits
- Simplified status management with a single source of truth
- More semantic status representation with enum values (`ACTIVE`, `TERMINATED`, `ON_LEAVE`, etc.)
- Clearer separation between HR concerns (employment status) and technical concerns

## Holiday Attendance Impact
- Holiday attendance records will now be created for all staff with `employment_status = 'ACTIVE'`
- This fixes the issue where some staff weren't getting holiday status properly
- The `DirectFixController` now provides tools for fixing inconsistent status records

## Migration Path
1. Run the database migration script
2. Use the `/api/debug/direct-fixes/fix-employment-status` endpoint to fix any inconsistent records
3. After updating employment statuses, use `/api/debug/direct-fixes/fix-holiday-attendance?date=2025-06-29` to fix holiday attendance records

## For Future Development
- Consider deprecating and eventually removing the `is_active` column
- Update UI components to work with employment status rather than active flags
- Add validation to ensure employment status is always set correctly
