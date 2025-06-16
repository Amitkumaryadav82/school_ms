# Complete Migration Guide

This guide outlines the steps required to complete the migration from `com.example.schoolms` packages to the consolidated `com.school` package structure.

## Overview

We have successfully:
- Fixed entity naming conflicts by adding unique entity names
- Created consolidated entities, repositories, services, and controllers in the proper packages
- Updated JPQL queries to use the correct entity names
- Created adapter classes to handle conversions between entity types

## Steps to Complete the Migration

### 1. Update Dependencies in Application Components

Replace any remaining uses of classes from the `com.example.schoolms` package with their consolidated counterparts:

| Old Class | New Class |
|-----------|-----------|
| com.example.schoolms.model.Staff | com.school.core.model.Staff |
| com.example.schoolms.model.TeacherDetails | com.school.core.model.TeacherDetails |
| com.example.schoolms.service.StaffService | com.school.core.service.StaffService |
| com.example.schoolms.controller.StaffController | com.school.core.controller.StaffController |
| com.example.schoolms.util.CsvXlsParser | com.school.common.util.CsvXlsParser |
| com.example.schoolms.dto.BulkUploadResponse | com.school.common.dto.BulkUploadResponse |
| com.example.schoolms.dto.BulkStaffRequest | com.school.staff.dto.BulkStaffRequest |

### 2. Update @Autowired Dependencies

Update any autowired dependencies that currently use qualifier names referencing the old packages:

```java
// OLD
@Autowired
@Qualifier("exampleSchoolmsStaffServiceImpl")
private StaffService staffService;

// NEW
@Autowired
private StaffService staffService; // or use @Qualifier("coreStaffServiceImpl") if needed
```

### 3. Testing the Application

Before removing the old packages, thoroughly test to ensure everything works correctly:

1. Unit test the consolidated classes
2. Build and run the application
3. Test all API endpoints that were previously using classes from `com.example.schoolms`
4. Test any bulk upload functionality
5. Verify that entity operations (create, read, update, delete) all work correctly with the consolidated classes

### 4. Update SchoolApplication Class

Once testing confirms that everything is working correctly, update the `SchoolApplication` class to remove references to the old package:

```java
@ComponentScan(basePackages = { "com.school" })
@EntityScan(basePackages = { "com.school" })
@EnableJpaRepositories(basePackages = { "com.school" })
```

### 5. Run Final Verification Tests

After updating the application class:

1. Build the application again
2. Run all tests
3. Start the application and verify it runs without errors
4. Test key functionality to ensure everything still works

### 6. Remove Old Package Structure

Once the application is confirmed to be working correctly without scanning the old packages, the final step is to remove the old package structure:

1. Delete the entire `com.example.schoolms` package tree
2. Run a full build to ensure there are no compilation errors
3. Run all tests again to verify nothing was broken

## Best Practices for Future Development

Going forward, follow these best practices:

1. **Entity Naming**: Always include a unique name in the `@Entity` annotation
2. **Package Structure**: Use the `com.school.*` package structure for all new code
3. **Repository Organization**: Keep repository interfaces in the same package as their entity classes
4. **Service Organization**: Maintain the separation of interfaces and implementations
5. **Documentation**: Document any significant changes to the package structure or entity naming

By following these guidelines, the system will avoid similar issues in the future and maintain a clean, organized codebase.
