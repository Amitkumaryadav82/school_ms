package com.school.exam.dto;

import java.util.List;

public class BulkMarksUpdateRequest {
    private Long examId;
    private Long classId;
    private Long subjectId;
    private List<BulkMarkItem> updates;

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public List<BulkMarkItem> getUpdates() {
        return updates;
    }

    public void setUpdates(List<BulkMarkItem> updates) {
        this.updates = updates;
    }

    public static class BulkMarkItem {
        private Long studentId;
        private Long questionFormatId;
        private Double obtainedMarks;
        private String evaluatorComments;

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public Long getQuestionFormatId() {
            return questionFormatId;
        }

        public void setQuestionFormatId(Long questionFormatId) {
            this.questionFormatId = questionFormatId;
        }

        public Double getObtainedMarks() {
            return obtainedMarks;
        }

        public void setObtainedMarks(Double obtainedMarks) {
            this.obtainedMarks = obtainedMarks;
        }

        public String getEvaluatorComments() {
            return evaluatorComments;
        }

        public void setEvaluatorComments(String evaluatorComments) {
            this.evaluatorComments = evaluatorComments;
        }
    }
}
