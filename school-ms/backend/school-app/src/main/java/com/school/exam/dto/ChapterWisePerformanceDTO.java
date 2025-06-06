package com.school.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for representing chapter-wise performance analysis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterWisePerformanceDTO {
    
    private Long studentId;
    private Long examId;
    private String examName;
    private String subject;
    
    private List<ChapterPerformance> chapterPerformances;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterPerformance {
        private String chapterName;
        private Double marksObtained;
        private Double totalMarks;
        private Double percentage;
        private List<QuestionPerformance> questionPerformances;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionPerformance {
        private Long questionId;
        private String questionType;
        private Double marksObtained;
        private Double totalMarks;
        private Double percentage;
    }
}
