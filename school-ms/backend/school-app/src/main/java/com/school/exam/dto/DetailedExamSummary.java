package com.school.exam.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;
import java.util.List;

@Data
@Builder
public class DetailedExamSummary {
    private Long examId;
    private String examName;
    private String subject;
    private Integer grade;
    private Integer totalStudents;
    private Double averageScore;
    private Double highestScore;
    private Double lowestScore;
    private Integer passCount;
    private Integer failCount;
    private Double passPercentage;

    // Additional fields for detailed analysis
    private Map<String, Double> chapterWisePerformance;
    private Map<String, Double> questionTypeWisePerformance;
    private Map<String, Double> difficultyLevelPerformance;
    private List<StudentPerformance> topPerformers;
    private List<QuestionPerformance> questionAnalysis;

    @Data
    @Builder
    public static class StudentPerformance {
        private Long studentId;
        private String studentName;
        private Double marksObtained;
        private Double percentage;
        private Map<String, Double> chapterWisePerformance;
    }

    @Data
    @Builder
    public static class QuestionPerformance {
        private Long questionId;
        private Integer questionNumber;
        private Double averageScore;
        private Double maxMarks;
        private Double scorePercentage;
        private Integer studentsAttempted;
        private Integer studentsGotFull;
        private Integer studentsGotZero;
    }
}
