package com.school.exam.dto.configuration;

import com.school.exam.model.configuration.SubjectType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for ConfigurationSubject entity responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfigurationSubjectDTO {

    private Long id;
    private Long classConfigurationId;
    private Long subjectMasterId;
    private String subjectCode;
    private String subjectName;
    private SubjectType subjectType;
    private Integer totalMarks;
    private Integer passingMarks;
    private Integer theoryMarks;
    private Integer practicalMarks;
    private Integer theoryPassingMarks;
    private Integer practicalPassingMarks;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Class configuration details
    private String className;
    private String section;
    private String academicYear;
    
    // Helper methods for UI display
    public String getDisplayName() {
        return String.format("%s - %s (%s) - %s", 
                           className, section, academicYear, subjectName);
    }
    
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
    
    public double getPassingPercentage() {
        if (totalMarks == null || passingMarks == null || totalMarks == 0) {
            return 0.0;
        }
        return (passingMarks.doubleValue() / totalMarks.doubleValue()) * 100.0;
    }
    
    public String getMarksDistribution() {
        if (subjectType == null) {
            return "N/A";
        }
        
        switch (subjectType) {
            case THEORY:
                return String.format("Theory: %d marks", totalMarks);
            case PRACTICAL:
                return String.format("Practical: %d marks", totalMarks);
            case BOTH:
                return String.format("Theory: %d, Practical: %d (Total: %d)", 
                                   theoryMarks, practicalMarks, totalMarks);
            default:
                return "N/A";
        }
    }
    
    public boolean supportsTheory() {
        return subjectType == SubjectType.THEORY || subjectType == SubjectType.BOTH;
    }
    
    public boolean supportsPractical() {
        return subjectType == SubjectType.PRACTICAL || subjectType == SubjectType.BOTH;
    }
    
    public boolean requiresBothComponents() {
        return subjectType == SubjectType.BOTH;
    }
}
