package com.school.exam.dto.configuration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for copy configuration response with details about the operation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CopyConfigurationResponse {

    private Long newConfigurationId;
    private String targetClassName;
    private String targetSection;
    private String targetAcademicYear;
    private Integer copiedSubjectsCount;
    private Integer skippedSubjectsCount;
    private List<CopySubjectResult> subjectResults;
    private List<String> warnings;
    private List<String> errors;
    private Boolean success;
    private String message;

    /**
     * Inner class for individual subject copy results
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CopySubjectResult {
        private Long subjectMasterId;
        private String subjectName;
        private String subjectCode;
        private Boolean copied;
        private String reason;
        private Long newConfigurationSubjectId;
    }

    public String getSummary() {
        if (Boolean.TRUE.equals(success)) {
            return String.format("Successfully copied %d subjects to %s - %s (%s)", 
                               copiedSubjectsCount, targetClassName, targetSection, targetAcademicYear);
        } else {
            return String.format("Copy operation failed: %s", message);
        }
    }
}
