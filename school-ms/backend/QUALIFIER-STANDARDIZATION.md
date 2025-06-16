# Qualifier Standardization Guide

## Problem Identified

We have identified inconsistent naming conventions in qualifier annotations across the codebase. This has led to dependency injection issues, particularly with service beans being referenced with incorrect qualifier names.

## Current Issues (RESOLVED)

1. **Duplicate Implementation Classes**: ✅ RESOLVED
   - Found duplicate `StaffServiceImpl` classes in two different packages with the same qualifier
   - Located at:
     - `com.example.schoolms.service.StaffServiceImpl` (KEPT - Primary implementation)
     - `com.example.schoolms.service.impl.StaffServiceImpl` (DEPRECATED - Qualifier changed to avoid conflicts)

2. **Inconsistent Qualifier Naming**: ✅ RESOLVED
   - Some qualifiers were using format `"exampleSchoolmsServiceStaffServiceImpl"` (with "Service" in the middle)
   - Others were using `"exampleSchoolmsStaffServiceImpl"` (without "Service" in the middle)
   - All qualifiers now follow the standardized naming convention documented below

## Standardized Naming Convention

To prevent future issues, we are adopting the following standardized naming convention for qualifiers:

### For Service Beans:
```
[packagePrefix][entityName]ServiceImpl
```

**Examples:**
- `exampleSchoolmsStaffServiceImpl`
- `schoolHrmStaffServiceImpl`
- `schoolAdmissionServiceImpl`

### For Repository Beans:
```
[packagePrefix][entityName]Repository
```

**Examples:**
- `exampleStaffRepository`
- `hrmStaffRepository`
- `admissionRepository`

## Implementation Plan

1. **Fix Immediate Qualifier Issues**: Fix any mismatched qualifiers where adapters or controllers are using different qualifier names than what the services provide.

2. **Consolidate Duplicate Implementations**: Determine which implementation should be the primary version and remove or rename others to prevent confusion.

3. **Add Documentation**: Add comments to explain the purpose of qualifiers and reference this document for standardization guidelines.

4. **Code Review Process**: Add a step in the code review process to verify that new qualifiers follow the standardized naming convention.

## Future Simplification Strategy

As part of the ongoing simplification effort:

1. Consider migrating to a more standardized dependency injection approach using package scanning and automatic component discovery where appropriate.

2. For cases where explicit qualification is necessary, use consistent naming conventions documented here.

3. When creating new adapter classes, ensure they correctly reference existing qualified beans.

## Reference List of Current Qualified Beans

### Services:
- `exampleSchoolmsStaffServiceImpl` - Primary Staff service implementation
- `schoolHrmStaffServiceImpl` - HRM module Staff service implementation

### Repositories:
- `exampleStaffRepository` - Primary Staff repository
- `hrmStaffRepository` - HRM module Staff repository

### Utilities:
- `exampleSchoolmsCsvXlsParser` - Parser for CSV and XLS files (updated from `csvXlsParser`)

## Most Recent Updates

- Fixed qualifier mismatch in `StaffServiceAdapter.java` by updating the implementation class qualifier.
- Updated `StaffController.java` to use the standardized qualifier name.
- Deprecated duplicate `StaffServiceImpl` in the `impl` package and changed its qualifier to avoid conflicts.
- Updated `CsvXlsParser` to use standardized qualifier naming convention.
- Updated `CsvXlsParserAdapter` to reference the updated qualifier name.
