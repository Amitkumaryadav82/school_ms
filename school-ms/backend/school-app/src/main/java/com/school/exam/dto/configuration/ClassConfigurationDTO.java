package com.school.exam.dto.configuration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for ClassConfiguration entity responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassConfigurationDTO {

    private Long id;
    private String className;
    private String academicYear;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional computed fields
    private Integer subjectCount;
    private Integer totalMarks;
    private List<ConfigurationSubjectDTO> subjects;
    
    // Helper methods for UI display
    public String getFullDisplayName() {
        return String.format("%s (%s)", className, academicYear);
    }
    
    public String getStatusDisplay() {
        return Boolean.TRUE.equals(isActive) ? "Active" : "Inactive";
    }
    
    public boolean hasSubjects() {
        return subjects != null && !subjects.isEmpty();
    }
}
