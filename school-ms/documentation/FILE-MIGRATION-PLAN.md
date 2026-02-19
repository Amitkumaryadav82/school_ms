# File Migration Plan

## Entities to Rename/Map

| Old Path | New Path | Status |
|----------|----------|--------|
| com.example.schoolms.model.Staff | com.school.core.model.Staff | ✓ |
| com.example.schoolms.model.TeacherDetails | com.school.core.model.TeacherDetails | ✓ |
| com.example.schoolms.repository.StaffRepository | com.school.core.repository.StaffRepository | ✓ |
| com.example.schoolms.repository.TeacherDetailsRepository | com.school.core.repository.TeacherDetailsRepository | ✓ |
| com.example.schoolms.service.StaffService | com.school.core.service.StaffService | ✓ |
| com.example.schoolms.service.StaffServiceImpl | com.school.core.service.StaffServiceImpl | ✓ |
| com.example.schoolms.service.impl.StaffServiceImpl | com.school.core.service.StaffServiceImpl | ✓ |
| com.example.schoolms.controller.StaffController | com.school.core.controller.StaffController | ✓ |
| com.example.schoolms.dto.BulkStaffRequest | com.school.staff.dto.BulkStaffRequest | ✓ |
| com.example.schoolms.dto.BulkUploadResponse | com.school.common.dto.BulkUploadResponse | ✓ |
| com.example.schoolms.util.CsvXlsParser | com.school.common.util.CsvXlsParser | ✓ |

## Other Duplicate Entities Found

| Entity 1 | Entity 2 | Resolution | Status |
|----------|----------|------------|--------|
| com.school.hrm.entity.Teacher | None | Add entity name annotation | ✓ |
| com.school.core.model.Staff | com.school.hrm.entity.Staff | Added unique entity names | ✓ |
| com.school.core.model.Staff | com.school.staff.model.Staff | Added unique entity names | ✓ |
| com.school.core.model.TeacherDetails | com.school.staff.model.TeacherDetails | Added unique entity names | ✓ |

## Migration Steps

1. ✓ Update entity annotations with unique names for any duplicates
2. ✓ Create consolidated classes in proper packages
3. ✓ Update dependencies and references
4. ⚠️ Remove classes from com.example package (Pending)

## Steps to Complete the Migration

1. **Final Testing**:
   - Test the application with the new consolidated classes
   - Verify that all functionalities work as expected

2. **Dependency Updates**:
   - ✅ Update any remaining references to com.example classes
   - ✅ Update autowired components to use the consolidated versions

3. **Clean Up**:
   - ✅ Remove the com.example.schoolms package scanning from SchoolApplication
   - ✅ Remove the com.example.schoolms from springdoc.packages-to-scan in application.properties
   - ⬜ Delete the com.example.schoolms package structure (See FINAL-MIGRATION-CHECKLIST.md)

4. **Documentation**:
   - ✅ Update any documentation that references the old package structure
   - ✅ Add migration notes for developers
   - ✅ Created MIGRATION-COMPLETION-SUMMARY.md

## Note on com.school.hrm.entity.Teacher

This entity now has a unique entity name "HrmTeacher" to prevent potential conflicts in the future.
