package com.school.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for managing mark entries for students
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarksEntryDTO {
    
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private Long examId;
    private Long subjectId;
    private String subjectName;
    private Boolean isAbsent;
    private String absenceReason;
    private List<QuestionMarkEntry> questionMarks;
    
    // Theory and practical summaries
    private Double totalTheoryMarks;
    private Double maxTheoryMarks;
    private Double totalPracticalMarks;
    private Double maxPracticalMarks;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionMarkEntry {
        private Long questionId;
        private Integer questionNumber;
        private String questionType;  // THEORY or PRACTICAL
        private String chapterName;
        private Double maxMarks;
        private Double obtainedMarks;
        private String evaluatorComments;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkMarksLockRequest {
        private Long examId;
        private Long subjectId;
        private List<Long> studentIds;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarksEditRequest {
        private Long marksId;
        private Double newMarks;
        private String editReason;
    }
}
