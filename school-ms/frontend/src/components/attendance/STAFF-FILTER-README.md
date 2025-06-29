# Staff Filtering in Attendance Dashboard

## Overview

This document explains how staff filtering works in the attendance dashboard (daily and weekly views).

## Implementation

We implement client-side filtering for staff data based on roles:

- **Teaching Staff**: Includes staff with roles containing "teacher", "librarian", or "principal" (case-insensitive)
- **Non-Teaching Staff**: Includes all other roles not matching the teaching criteria
- **All Staff**: Shows all staff regardless of role

## Advantages of Client-Side Filtering

1. **Performance**: For a moderate-sized school (up to ~500 staff), client-side filtering is performant and reduces API calls
2. **Flexibility**: Easy to modify filter criteria without backend changes
3. **Immediate updates**: Filters apply instantly without waiting for server response

## Filter Logic

The code checks the staff role in multiple ways to accommodate different data structures:

```javascript
// Get role name regardless of structure (string or object)
let roleName = '';

if (typeof staff.role === 'string') {
  roleName = staff.role.toLowerCase();
} else if (staff.role && typeof staff.role === 'object' && 'name' in staff.role) {
  roleName = (staff.role.name || '').toLowerCase();
} else if (staff.staffRole && typeof staff.staffRole === 'object' && 'name' in staff.staffRole) {
  roleName = (staff.staffRole.name || '').toLowerCase();
}

// Match based on staffType
if (staffType === 'TEACHING') {
  return teachingRoles.some(role => roleName.includes(role));
} else if (staffType === 'NON_TEACHING') {
  return !teachingRoles.some(role => roleName.includes(role));
}
```

## Future Considerations

For schools with significantly larger staff (1000+), consider:

1. Adding backend filtering endpoints
2. Implementing pagination
3. Using virtualized lists for performance

## Components Using This Feature

- `AttendanceWeeklyView.tsx`
- `AttendanceDailyView.tsx`
