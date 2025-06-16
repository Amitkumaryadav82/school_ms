# Final Migration Checklist

This document provides a checklist for the final step of the migration process: removing the `com.example.schoolms` package and all its contents.

## Pre-Deletion Verification

Before deleting any files, ensure the following conditions are met:

- [ ] All functionality from `com.example.schoolms` has been migrated to equivalent classes in `com.school`
- [ ] SchoolApplication.java has been updated to remove all references to `com.example.schoolms`
- [ ] Application.properties has been updated to remove `com.example.schoolms` from `springdoc.packages-to-scan`
- [ ] All tests that previously depended on `com.example.schoolms` classes have been updated to use the new classes
- [ ] Application starts up successfully without any errors related to missing beans or components
- [ ] All API endpoints work correctly when accessed through Swagger or direct HTTP calls

## Files to Delete

The following files and directories should be deleted:

### Models
- [ ] `com/example/schoolms/model/Staff.java`
- [ ] `com/example/schoolms/model/TeacherDetails.java`

### DTOs
- [ ] `com/example/schoolms/dto/BulkStaffRequest.java`
- [ ] `com/example/schoolms/dto/BulkUploadResponse.java`

### Repositories
- [ ] `com/example/schoolms/repository/StaffRepository.java`
- [ ] `com/example/schoolms/repository/TeacherDetailsRepository.java`

### Services
- [ ] `com/example/schoolms/service/StaffService.java`
- [ ] `com/example/schoolms/service/StaffServiceImpl.java`
- [ ] `com/example/schoolms/service/impl/StaffServiceImpl.java`

### Controllers
- [ ] `com/example/schoolms/controller/StaffController.java`

### Utilities
- [ ] `com/example/schoolms/util/CsvXlsParser.java`

## Post-Deletion Verification

After deleting the files, verify that:

- [ ] Application compiles successfully
- [ ] Application starts up without errors
- [ ] All API endpoints continue to function correctly
- [ ] All tests pass

## Command to Execute Deletion

The following command can be used to remove the entire package structure:

```bash
rm -rf backend/school-app/src/main/java/com/example/schoolms
```

## Rollback Plan

In case of any issues after deletion, the files can be restored from version control:

```bash
git checkout -- backend/school-app/src/main/java/com/example/schoolms
```

Then revert the changes to SchoolApplication.java and application.properties to restore component scanning for the `com.example.schoolms` package.

## Date Completed

June 14, 2025
