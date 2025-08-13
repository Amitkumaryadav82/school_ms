package com.school.exam.dto;

import java.util.List;

public class MarksMatrixSaveRequest {
    private Long examId;
    private Long classId;
    private List<Row> rows;

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }
    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }
    public List<Row> getRows() { return rows; }
    public void setRows(List<Row> rows) { this.rows = rows; }

    public static class Row {
        private Long studentId;
        private List<Cell> subjects; // matches frontend columns in order

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public List<Cell> getSubjects() { return subjects; }
        public void setSubjects(List<Cell> subjects) { this.subjects = subjects; }
    }

    public static class Cell {
        private Long subjectId;
        private Double theoryMarks;
        private Double practicalMarks;
        private Boolean absent;
        private String absenceReason;

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
        public Double getTheoryMarks() { return theoryMarks; }
        public void setTheoryMarks(Double theoryMarks) { this.theoryMarks = theoryMarks; }
        public Double getPracticalMarks() { return practicalMarks; }
        public void setPracticalMarks(Double practicalMarks) { this.practicalMarks = practicalMarks; }
        public Boolean getAbsent() { return absent; }
        public void setAbsent(Boolean absent) { this.absent = absent; }
        public String getAbsenceReason() { return absenceReason; }
        public void setAbsenceReason(String absenceReason) { this.absenceReason = absenceReason; }
    }
}
