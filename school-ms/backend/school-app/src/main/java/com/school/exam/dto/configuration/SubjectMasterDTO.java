package com.school.exam.dto.configuration;

import com.school.exam.model.configuration.SubjectType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for SubjectMaster entity responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectMasterDTO {

    private Long id;
    private String subjectCode;
    private String subjectName;
    private String description;
    private SubjectType subjectType;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional computed fields
    private Long configurationCount;
    private Boolean isInUse;
    
    // Helper methods for UI display
    public String getSubjectTypeDisplay() {
        if (subjectType == null) {
            return "Unknown";
        }
        switch (subjectType) {
            case THEORY:
                return "Theory Only";
            case PRACTICAL:
                return "Practical Only";
            case BOTH:
                return "Theory & Practical";
            default:
                return subjectType.toString();
        }
    }
    
    public String getStatusDisplay() {
        return Boolean.TRUE.equals(isActive) ? "Active" : "Inactive";
    }
}
