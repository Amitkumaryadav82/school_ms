package com.school.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for handling the tabulation sheet data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TabulationSheetDTO {
    
    private Integer grade;
    private String section;
    private String examName;
    private String academicYear;
    private List<SubjectMarkSummary> subjects;
    private List<StudentResult> students;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectMarkSummary {
        private String subjectName;
        private Double maxTheoryMarks;
        private Double maxPracticalMarks;
        private Double passingMarks;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentResult {
        private Long studentId;
        private String rollNumber;
        private String name;
        private List<SubjectMarks> subjectMarks;
        private Integer totalWorkingDays;
        private Integer daysPresent;
        private Double totalMarksObtained;
        private Double totalMaxMarks;
        private Double percentage;
        private Integer rank;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectMarks {
        private String subjectName;
        private Double theoryMarks;
        private Double practicalMarks;
        private Double total;
        private Boolean isAbsent;
        private String grade; // A+, A, B+, etc.
    }
}
