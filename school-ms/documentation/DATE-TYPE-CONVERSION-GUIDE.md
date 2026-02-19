# Date Type and JPA API Conversion Guide

## Overview

During the migration from `com.example.schoolms` to `com.school` package structure, we encountered two major incompatibility issues:

1. Different date/time types between legacy and new code
2. Different JPA API versions (javax.persistence vs jakarta.persistence)

This document explains how to handle these conversions correctly.

## Problems

### Date/Time Types
The legacy code (`com.example.schoolms`) used `java.util.Date` for date fields, while the new consolidated code uses the modern Java 8+ date/time API with `java.time.LocalDate` and `java.time.LocalDateTime`.

This causes type incompatibility errors when adapters try to transfer data between the legacy and new models.

### JPA API Migration
The project is currently using the older `javax.persistence` API. We attempted to migrate to `jakarta.persistence` but encountered compatibility issues. For now, we need to maintain all legacy code with `javax.persistence`.

## Solutions

### Date Type Conversion
We have implemented several fixes for date type conversion:

1. Updated all legacy model classes to use `java.util.Date` consistently
2. Created a `DateConverter` utility class to convert between date/time types
3. Fixed adapter classes to use the `DateConverter`

### JPA API Consistency
For JPA annotations, we need to maintain consistency:

1. Legacy code (`com.example.schoolms.*`): Use `javax.persistence.*` annotations
2. New code (`com.school.*`): Use `javax.persistence.*` annotations until a complete migration is possible

## Using DateConverter

The `DateConverter` utility class provides methods to convert between different date/time types:

```java
// Import the utility class
import com.school.common.util.DateConverter;

// Converting from java.time to java.util
Date date = DateConverter.toDate(localDate);
Date dateTime = DateConverter.toDate(localDateTime);

// Converting from java.util to java.time
LocalDate localDate = DateConverter.toLocalDate(date);
LocalDateTime localDateTime = DateConverter.toLocalDateTime(date);
```

## Common Patterns for Adapters

When converting between legacy and new models, use the converter:

```java
// In adapter methods
private LegacyStaff convertToLegacyStaff(Staff staff) {
    LegacyStaff legacyStaff = new LegacyStaff();
    
    // ... copy other properties ...
    
    // Convert LocalDate to Date
    legacyStaff.setDateOfBirth(DateConverter.toDate(staff.getDateOfBirth()));
    legacyStaff.setJoiningDate(DateConverter.toDate(staff.getJoiningDate()));
    
    return legacyStaff;
}

private Staff convertFromLegacyStaff(LegacyStaff legacyStaff) {
    Staff staff = new Staff();
    
    // ... copy other properties ...
    
    // Convert Date to LocalDate
    staff.setDateOfBirth(DateConverter.toLocalDate(legacyStaff.getDateOfBirth()));
    staff.setJoiningDate(DateConverter.toLocalDate(legacyStaff.getJoiningDate()));
    
    return staff;
}
```

## Migration Status

### Date Type Migration
The following classes have been updated to use `java.util.Date`:

- `com.example.schoolms.model.Staff`
- `com.example.schoolms.model.TeacherDetails`

### JPA API Usage
The following classes have been confirmed to use `javax.persistence`:

- `com.example.schoolms.model.Staff`
- `com.example.schoolms.model.TeacherDetails`

Any new classes in the `com.school` namespace that were using `jakarta.persistence` should be reviewed and updated to use `javax.persistence` instead.

The following classes need to use `DateConverter` when converting between models:

- `com.school.core.adapter.EntityAdapter`
- `com.school.staff.adapter.StaffAdapter`
- `com.school.staff.controller.StaffBulkController`
- `com.school.staff.service.StaffServiceAdapter`
- `com.school.staff.util.CsvXlsParserAdapter`
- `com.school.common.util.CsvXlsParser`

## Next Steps

1. Fix all remaining type conversion issues in adapter classes
2. Review other `com.school` namespace classes to ensure they use `javax.persistence` instead of `jakarta.persistence`
3. Run unit tests to verify conversions work correctly
4. Verify end-to-end functionality
5. Plan for a coordinated future migration to Jakarta EE when all code can be updated at once

## Date Completed

June 14, 2025
