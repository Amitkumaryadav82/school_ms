# Reports Error Fix

## Issue
When clicking on the "Reports" tab in the Staff Attendance Management dashboard, the following error was occurring:

```
Uncaught TypeError: Cannot read properties of undefined (reading 'forEach')
at AttendanceReports.tsx:163:39
```

## Root Cause
In the `AttendanceReports.tsx` component, there were missing null checks when trying to access `employeeSummaries` property of the `monthlyReport` object. Even though there was a check for `monthlyReport`, there was no validation that `monthlyReport.employeeSummaries` existed before trying to iterate over it with `.forEach()`.

## Changes Made

1. Added null checks for `monthlyReport.employeeSummaries` in the trend data calculation:
```typescript
// Before
if (monthlyReport) {
  // ...
  monthlyReport.employeeSummaries.forEach(employee => { /* ... */ });
}

// After
if (monthlyReport && monthlyReport.employeeSummaries) {
  // ...
  monthlyReport.employeeSummaries.forEach(employee => { /* ... */ });
}
```

2. Added similar null checks in the department data calculation:
```typescript
// Before
if (!monthlyReport) return [];
// ...
monthlyReport.employeeSummaries.forEach(employee => { /* ... */ });

// After
if (!monthlyReport || !monthlyReport.employeeSummaries) return [];
// ...
monthlyReport.employeeSummaries.forEach(employee => { /* ... */ });
```

3. Added a fallback for parsing the attendance percentage:
```typescript
// Before
deptMap[dept].attendanceRate += parseFloat(employee.attendancePercentage);

// After
deptMap[dept].attendanceRate += parseFloat(employee.attendancePercentage || '0');
```

## Impact
These changes provide proper defensive programming against undefined values, ensuring that the Reports tab works correctly even when data is not fully loaded or formatted as expected.

The error has been resolved and users can now navigate to and use the Reports tab without encountering errors.
