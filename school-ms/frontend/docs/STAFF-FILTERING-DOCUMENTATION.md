# Staff Filtering Implementation

## Overview
This document explains how staff filtering is implemented in the School Management System's attendance modules. Rather than relying on backend filtering, we've implemented client-side filtering to improve flexibility and reduce server load for datasets under 500 staff members.

## Implementation Details

### Staff Type Filters
The system supports the following staff type filters:
- **All Staff**: No filtering applied
- **Teaching Staff**: Filters for staff with teaching-related roles
- **Non-Teaching Staff**: Filters for staff without teaching-related roles
- **Administration**: Filters for staff with management roles

### How It Works

1. The frontend fetches all staff members using `staffService.getAll()`
2. Client-side filtering is applied based on the selected filter type:
   - Role names are extracted regardless of the data structure (string or object)
   - Case-insensitive matching is performed against predefined role lists
   - Results are filtered accordingly

### Role Matching Logic

```typescript
// Teaching staff roles (case-insensitive matching)
const teachingRoles = ['teacher', 'librarian', 'principal'];

// Administration staff roles (case-insensitive matching)
const administrationRoles = ['management', 'admin', 'director', 'supervisor'];
```

The system checks if any of these keywords appear in the staff member's role name. This provides flexibility to match variations like "Senior Teacher" or "Assistant Principal".

## Affected Components

These changes have been implemented in:
- `AttendanceDailyView.tsx`
- `AttendanceWeeklyView.tsx`
- `StaffAttendance.tsx` (dropdown selection)

## Performance Considerations

This client-side filtering approach is suitable for up to approximately 500 staff members. For larger organizations, backend filtering may be more appropriate to reduce network traffic and client-side processing.

## Extending the Filtering Logic

To add new filter categories:
1. Add a new MenuItem to the staff type dropdown in `StaffAttendance.tsx`
2. Define the role keywords array in the filtering components
3. Add the filtering logic condition to the component's filter function

Example:
```typescript
else if (staffType === 'NEW_CATEGORY') {
  return newCategoryRoles.some(role => roleName.includes(role));
}
```
