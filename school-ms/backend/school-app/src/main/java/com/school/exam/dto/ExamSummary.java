package com.school.exam.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class ExamSummary {
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
    private Map<String, Long> scoreDistribution; // Range -> Count (e.g., "90-100" -> 5)
    private Map<String, Double> sectionWiseAverage; // Section -> Average Score
}