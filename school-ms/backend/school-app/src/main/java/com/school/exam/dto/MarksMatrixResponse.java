package com.school.exam.dto;

import java.util.List;

public class MarksMatrixResponse {
    private List<SubjectColumn> subjects; // ordered columns
    private List<StudentRow> students;    // rows

    public List<SubjectColumn> getSubjects() { return subjects; }
    public void setSubjects(List<SubjectColumn> subjects) { this.subjects = subjects; }
    public List<StudentRow> getStudents() { return students; }
    public void setStudents(List<StudentRow> students) { this.students = students; }

    public static class SubjectColumn {
        private Long subjectId;
        private String subjectName;
        private Double totalMaxMarks; // sum of QPF marks for exam/class/subject

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
        public Double getTotalMaxMarks() { return totalMaxMarks; }
        public void setTotalMaxMarks(Double totalMaxMarks) { this.totalMaxMarks = totalMaxMarks; }
    }

    public static class StudentRow {
        private Long studentId;
        private String studentName;
        private String rollNumber;
        private List<StudentSubjectCell> cells; // aligns to subjects by index

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        public List<StudentSubjectCell> getCells() { return cells; }
        public void setCells(List<StudentSubjectCell> cells) { this.cells = cells; }
    }

    public static class StudentSubjectCell {
        private Long subjectId;
        private Double theoryMarks;    // nullable
        private Double practicalMarks; // nullable
        private Boolean absent;        // nullable
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
