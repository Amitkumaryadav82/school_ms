# Daily vs Weekly Attendance View Comparison

This document summarizes the key differences between the working Daily Attendance View and the problematic Weekly Attendance View. Understanding these differences helped to fix the issue where staff data wasn't being displayed in the weekly view after tab removal.

## Key Differences

### 1. Staff Data Fetching Strategy

#### Daily View (Working):
```typescript
// Fetch staff members based on type
const { data: staffMembers } = useApi(() => {
  return staffType === 'TEACHING' 
    ? staffService.getActiveTeachers()
    : staffType === 'NON_TEACHING'
      ? staffService.getNonTeachingStaff() 
      : staffService.getAll();
}, { dependencies: [staffType] });
```

#### Weekly View (Original - Not Working):
```typescript
const { data: teachers, error: teachersError, loading: teachersLoading } = useApi(() => {
  console.log('AttendanceWeeklyView - Fetching teachers with staffType:', staffType);
  return staffService.getActiveTeachers(staffType);
}, { dependencies: [staffType] });
```

### 2. API Paths and Parameters

#### Daily View (Working):
Uses standard API path structure with proper API methods:
```typescript
employeeAttendanceService.getAttendanceByDate(date, staffType)
```

#### Weekly View (Original - Not Working):
Had incorrect endpoint path in staffService:
```typescript
// Missing /api prefix in the endpoint
const endpoint = 'staff';
```

### 3. Cache Control

#### Daily View (Working):
Has explicit cache control to ensure fresh data:
```typescript
{
  dependencies: [date, staffType],
  cacheTime: 0 // Ensure fresh data each time
}
```

#### Weekly View (Original - Not Working):
No cache control specified.

### 4. Debugging and Error Handling

#### Daily View (Working):
More extensive error handling and logging:
```typescript
console.log('Saving attendance with data:', attendanceRecord);
// ... more logs
```

#### Weekly View (Original - Not Working):
Limited error handling and debugging output.

## Fixed Implementation

Updated Weekly View to match the patterns from Daily View:

```typescript
// Fetch staff members - using same approach as in Daily View
const { data: teachers, error: teachersError, loading: teachersLoading } = useApi(() => {
  console.log('AttendanceWeeklyView - Fetching teachers with staffType:', staffType);
  // Use the same staff loading logic as Daily View for consistency
  return staffType === 'TEACHING' 
    ? staffService.getActiveTeachers()
    : staffType === 'NON_TEACHING'
      ? staffService.getNonTeachingStaff() 
      : staffService.getAll();
}, { dependencies: [staffType] });

// Fetch attendance data with explicit logging and no caching
const { data: attendanceData, error: attendanceError, loading: attendanceLoading } = useApi(() => {
  console.log(`WeeklyView - Fetching attendance for date range: ${startDate} to ${endDate}, staffType: ${staffType}`);
  return employeeAttendanceService.getAttendanceByDateRange(startDate, endDate, staffType);
}, { 
  dependencies: [startDate, endDate, staffType],
  cacheTime: 0 // Ensure fresh data each time, matching Daily View
});
```

## Best Practices Identified

1. **Consistent API Path Structure**: Always include `/api` prefix in endpoint paths
2. **Consistent Staff Data Loading**: Use the same pattern for loading staff across all views
3. **Cache Control**: Set appropriate cache control to ensure fresh data when needed
4. **Comprehensive Logging**: Log API requests, parameters, and results for easier debugging
5. **Error Handling**: Add detailed error reporting to quickly identify issues

By aligning the Weekly View implementation with these best practices from the Daily View, we've resolved the data display issue.
