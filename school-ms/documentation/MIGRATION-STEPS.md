# Migration Steps for Code Consolidation

## Overview

This document outlines the steps to consolidate duplicate code across different packages, particularly focusing on migrating functionality from the legacy `com.example.schoolms` package to the consolidated packages in the `com.school` namespace.

## Entity Naming Strategy

To resolve entity naming conflicts, we've adopted the following naming convention:

1. `com.school.core.model.*` entities use their class name prefixed with "Core" (e.g., `CoreStaff`)
2. `com.school.hrm.entity.*` entities use their class name prefixed with "Hrm" (e.g., `HrmStaff`)
3. `com.school.staff.model.*` entities use their class name prefixed with "StaffModule" (e.g., `StaffModuleTeacherDetails`)
4. `com.example.schoolms.model.*` entities use their class name prefixed with "Example" (e.g., `ExampleStaff`)

## Migration Path

### Current State
- Multiple implementations of the same entity are spread across different packages
- Legacy code in `com.example.schoolms` is being used by adapters and converters
- `com.school.core.model` contains the consolidated entities that should be used going forward

### Entity Consolidation Plan

1. **Staff Entity**:
   - Target: `com.school.core.model.Staff` (consolidated entity)
   - Sources:
     - `com.school.hrm.entity.Staff` (deprecated)
     - `com.school.staff.model.Staff` (deprecated)
     - `com.example.schoolms.model.Staff` (deprecated)

2. **TeacherDetails Entity**:
   - Target: `com.school.core.model.TeacherDetails` (to be created/consolidated)
   - Sources:
     - `com.school.staff.model.TeacherDetails`
     - `com.example.schoolms.model.TeacherDetails` (deprecated)

### Repository Consolidation Plan

1. **Staff Repository**:
   - Target: `com.school.core.repository.StaffRepository` (consolidated repository)
   - Sources:
     - `com.school.hrm.repository.StaffRepository` (@Repository("hrmStaffRepository"))
     - `com.school.staff.repository.StaffRepository` (@Repository("schoolStaffRepository"))
     - `com.example.schoolms.repository.StaffRepository` (@Repository("exampleStaffRepository"))

2. **TeacherDetails Repository**:
   - Target: `com.school.core.repository.TeacherDetailsRepository` (to be created)
   - Sources:
     - `com.school.staff.repository.TeacherDetailsRepository`
     - `com.example.schoolms.repository.TeacherDetailsRepository`

### Service Consolidation Plan

1. **Staff Service**:
   - Target: `com.school.core.service.StaffService` and `StaffServiceImpl` (consolidated service)
   - Sources:
     - `com.school.hrm.service.StaffService` and implementations
     - `com.school.staff.service.StaffService` and implementations
     - `com.example.schoolms.service.StaffService` and implementations

### Controller Consolidation Plan
   
1. **Staff Controllers**:
   - Target: `com.school.core.controller.StaffController` (consolidated controller)
   - Sources:
     - `com.school.hrm.controller.StaffController`
     - `com.school.staff.controller.StaffController`
     - `com.example.schoolms.controller.StaffController`

## Implementation Steps

### Phase 1: Entity Naming and JPQL Fixes (Current)
1. ✅ Ensure all entity classes have unique JPA entity names
2. ✅ Update JPQL queries to reference the correct entity names 

### Phase 2: Create Missing Consolidated Entities
1. Create consolidated `TeacherDetails` in core package if it doesn't exist
2. Add appropriate relationships to the consolidated `Staff` entity

### Phase 3: Update or Create Adapters
1. Update existing adapter classes to ensure proper conversion between entity types
2. Create new adapters for entities that don't have them yet

### Phase 4: Controller Updates
1. Modify controllers to use the consolidated services
2. Ensure backward compatibility through adapters during the transition

### Phase 5: Service Layer Updates
1. Update service implementations to use consolidated repositories
2. Maintain backward compatibility during transition

### Phase 6: Repository Cleanup
1. Ensure all repositories reference the correct entity classes
2. Update any custom query methods to use correct entity names

### Phase 7: Dependency Cleanup
1. Update any remaining dependencies on legacy classes
2. Remove references to legacy packages from configuration

### Phase 8: Removal of Legacy Code
1. Once all functionality has been migrated, mark legacy classes for removal
2. Create a schedule for removing the legacy code after sufficient testing

## Tracking

For each file that needs consolidation:
1. Add appropriate @Deprecated annotations with migration instructions
2. Document in code comments which class is the replacement
3. Update the PACKAGE-MIGRATION-PLAN.md file to track progress

## Testing Strategy

For each consolidation step:
1. Unit test the consolidated class
2. Integration test with dependent components
3. End-to-end test through relevant API endpoints
