package com.school.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @deprecated This DTO is being phased out in favor of the consolidated TeacherDetailsDTO in the core package.
 * This class is kept for backward compatibility during the migration process.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Deprecated
public class TeacherDetailsDTO {
    private Long id;
    private String qualification;
    private Integer yearsOfExperience;
    private String specialization;
    private Long staffId;
    private String department;
    private String subjects;
    private Integer teachingExperience;
    private Boolean isClassTeacher;
    private Long classAssignedId;
    private String classAssignedName;
}
