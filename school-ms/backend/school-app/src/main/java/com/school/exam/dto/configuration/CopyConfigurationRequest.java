package com.school.exam.dto.configuration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * DTO for copying class configuration from one class to another
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CopyConfigurationRequest {

    @NotNull(message = "Source configuration ID is required")
    private Long sourceConfigurationId;

    @NotBlank(message = "Target class name is required")
    @Size(min = 1, max = 50, message = "Class name must be between 1 and 50 characters")
    private String targetClassName;

    @NotBlank(message = "Target section is required")
    @Size(min = 1, max = 20, message = "Section must be between 1 and 20 characters")
    private String targetSection;

    @NotBlank(message = "Target academic year is required")
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "Academic year must be in format YYYY-YY (e.g., 2023-24)")
    private String targetAcademicYear;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    // Subject-specific configurations
    private List<CopySubjectConfiguration> subjectConfigurations;

    // Options for copying behavior
    @Builder.Default
    private Boolean copyAllSubjects = true;

    @Builder.Default
    private Boolean preserveMarks = true;

    @Builder.Default
    private Boolean overwriteExisting = false;

    /**
     * Inner class for subject-specific copy configurations
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CopySubjectConfiguration {
        private Long subjectMasterId;
        private Boolean include;
        private Integer newTotalMarks;
        private Integer newPassingMarks;
        private Integer newTheoryMarks;
        private Integer newPracticalMarks;
        private Integer newTheoryPassingMarks;
        private Integer newPracticalPassingMarks;
    }
}
