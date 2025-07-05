package com.school.exam.dto.configuration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/**
 * DTO for ClassConfiguration entity requests (create/update operations)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassConfigurationRequest {

    @NotBlank(message = "Class name is required")
    @Size(min = 1, max = 50, message = "Class name must be between 1 and 50 characters")
    private String className;

    @NotBlank(message = "Section is required")
    @Size(min = 1, max = 20, message = "Section must be between 1 and 20 characters")
    private String section;

    @NotBlank(message = "Academic year is required")
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "Academic year must be in format YYYY-YY (e.g., 2023-24)")
    private String academicYear;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Builder.Default
    private Boolean isActive = true;
}
