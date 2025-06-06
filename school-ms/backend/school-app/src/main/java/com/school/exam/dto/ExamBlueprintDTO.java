package com.school.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for handling the question paper blueprint creation and validation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamBlueprintDTO {
    
    private Long examId;
    private Long examConfigurationId;
    private String name;
    private String description;
    private List<ChapterDistributionDTO> chapterDistributions;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterDistributionDTO {
        private String chapterName;
        private List<SectionDistribution> sectionDistributions;
        private Double totalMarks;
        private Double weightagePercentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionDistribution {
        private String sectionName;
        private String questionType;
        private Integer questionCount;
        private Double marksPerQuestion;
        private Double totalMarks;
    }
    
    // For blueprint validation
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlueprintValidationResult {
        private boolean isValid;
        private List<ValidationIssue> issues;
        
        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class ValidationIssue {
            private String chapterName;
            private String questionType;
            private String message;
            private ValidationSeverity severity;
            
            public enum ValidationSeverity {
                WARNING, ERROR
            }
        }
    }
}
