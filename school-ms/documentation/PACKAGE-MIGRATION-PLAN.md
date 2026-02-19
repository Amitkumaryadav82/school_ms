# Package Consolidation Migration Plan

This document outlines the plan to consolidate the `com.example.schoolms` package structure into the `com.school` package structure.

## Progress Summary

- **Completed**: Phase 1 (Core Model and Service Classes) and Phase 2 (Repository Classes)
- **In Progress**: Phase 3 (Controller Classes) and Phase 4 (Clean up)
- **Last Updated**: June 13, 2025

## Objectives

1. Move all classes from `com.example.schoolms.*` to equivalent `com.school.*` packages
2. Update imports in all affected files
3. Ensure all beans are properly qualified and discoverable
4. Remove redundant classes and resolve duplications
5. Document changes for team awareness

## Classes to Migrate

### Phase 1 - Core Model and Service Classes ✅

| Source | Destination | Status |
|--------|-------------|--------|
| `com.example.schoolms.model.Staff` | `com.school.staff.model.Staff` | ✅ Completed |
| `com.example.schoolms.model.TeacherDetails` | `com.school.staff.model.TeacherDetails` | ✅ Completed |
| `com.example.schoolms.dto.BulkUploadResponse` | `com.school.common.dto.BulkUploadResponse` | ✅ Completed |
| `com.example.schoolms.dto.BulkStaffRequest` | `com.school.staff.dto.BulkStaffRequest` | ✅ Completed |
| `com.example.schoolms.service.StaffService` | `com.school.staff.service.StaffService` | ✅ Completed |
| `com.example.schoolms.service.StaffServiceImpl` | `com.school.staff.service.StaffServiceImpl` | ✅ Completed |
| `com.example.schoolms.util.CsvXlsParser` | `com.school.common.util.CsvXlsParser` | ✅ Completed |

### Phase 2 - Repository Classes ✅

| Source | Destination | Status |
|--------|-------------|--------|
| `com.example.schoolms.repository.StaffRepository` | `com.school.staff.repository.StaffRepository` | ✅ Completed |
| `com.example.schoolms.repository.TeacherDetailsRepository` | `com.school.staff.repository.TeacherDetailsRepository` | ✅ Completed |

### Phase 3 - Controller Classes

| Source | Destination | Action |
|--------|-------------|--------|
| `com.example.schoolms.controller.StaffController` | `com.school.staff.controller.StaffController` | Create new class, migrate implementation |

### Phase 4 - Clean up

- Remove deprecated classes
- Remove duplicate implementations
- Update documentation

## Implementation Approach

For each class migration:

1. Create the new class in the `com.school` package structure
2. Copy and adapt the implementation from the old class
3. Update imports to reference new package structure
4. Update dependencies and qualifiers to use new package structure
5. Mark old class as deprecated with `@Deprecated` annotation and javadoc comment
6. Update any classes that depend on the old class to use the new one
7. Verify application builds and runs correctly after each phase

## Qualifier Updates

When moving classes, we're updating qualifiers to match our standardized naming convention:

| Old Qualifier | New Qualifier | Status |
|--------------|---------------|--------|
| `exampleSchoolmsStaffServiceImpl` | `schoolStaffServiceImpl` | ✅ Updated |
| `exampleStaffRepository` | `schoolStaffRepository` | ✅ Updated |
| `exampleSchoolmsCsvXlsParser` | `schoolCommonCsvXlsParser` | ✅ Updated |

## Testing Plan

After each phase:
1. Rebuild the application
2. Run unit tests if available
3. Run the application and verify no startup errors
4. Test affected functionality through the API

## Rollback Plan

If issues arise:
1. Revert to the last working commit
2. Temporarily revert to using both package scannings in `SchoolApplication.java`
3. Fix issues and retry migration
