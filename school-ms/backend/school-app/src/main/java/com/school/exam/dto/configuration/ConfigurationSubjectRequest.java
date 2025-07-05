package com.school.exam.dto.configuration;

import com.school.exam.model.configuration.SubjectType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

/**
 * DTO for ConfigurationSubject entity requests (create/update operations)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfigurationSubjectRequest {

    @NotNull(message = "Class configuration ID is required")
    private Long classConfigurationId;

    @NotNull(message = "Subject master ID is required")
    private Long subjectMasterId;

    @NotNull(message = "Effective subject type is required")
    private SubjectType effectiveSubjectType;

    @NotNull(message = "Total marks is required")
    @Min(value = 1, message = "Total marks must be at least 1")
    private Integer totalMarks;

    @NotNull(message = "Passing marks is required")
    @Min(value = 1, message = "Passing marks must be at least 1")
    private Integer passingMarks;

    @Min(value = 1, message = "Theory marks must be at least 1 if specified")
    private Integer theoryMarks;

    @Min(value = 1, message = "Practical marks must be at least 1 if specified")
    private Integer practicalMarks;

    @Min(value = 1, message = "Theory passing marks must be at least 1 if specified")
    private Integer theoryPassingMarks;

    @Min(value = 1, message = "Practical passing marks must be at least 1 if specified")
    private Integer practicalPassingMarks;

    @Builder.Default
    private Boolean isActive = true;
}
