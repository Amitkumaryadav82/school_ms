package com.school.exam.dto.configuration;

import com.school.exam.model.configuration.SubjectType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * DTO for SubjectMaster entity requests (create/update operations)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectMasterRequest {

    @NotBlank(message = "Subject code is required")
    @Size(min = 2, max = 20, message = "Subject code must be between 2 and 20 characters")
    private String subjectCode;

    @NotBlank(message = "Subject name is required")
    @Size(min = 2, max = 100, message = "Subject name must be between 2 and 100 characters")
    private String subjectName;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Subject type is required")
    private SubjectType subjectType;

    @Builder.Default
    private Boolean isActive = true;
}
