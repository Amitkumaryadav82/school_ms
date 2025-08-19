package com.school.exam.dto;

import java.util.List;

public class MarksMatrixDTO {
    private Long examId;
    private Long classId;
    private String section; // optional, for student filtering
    private List<SubjectCol> subjects; // columns constrained by QPF
    private List<StudentRow> students; // rows

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

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public List<SubjectCol> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<SubjectCol> subjects) {
        this.subjects = subjects;
    }

    public List<StudentRow> getStudents() {
        return students;
    }

    public void setStudents(List<StudentRow> students) {
        this.students = students;
    }

    public static class SubjectCol {
        private Long subjectId;
        private String subjectName;
        private Double maxTheory;
        private Double maxPractical;

        public Long getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(Long subjectId) {
            this.subjectId = subjectId;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public void setSubjectName(String subjectName) {
            this.subjectName = subjectName;
        }

        public Double getMaxTheory() {
            return maxTheory;
        }

        public void setMaxTheory(Double maxTheory) {
            this.maxTheory = maxTheory;
        }

        public Double getMaxPractical() {
            return maxPractical;
        }

        public void setMaxPractical(Double maxPractical) {
            this.maxPractical = maxPractical;
        }
    }

    public static class StudentRow {
        private Long studentId;
        private String studentName;
        private String rollNumber;
        private List<Cell> cells; // aligned with subjects order

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }

        public String getRollNumber() {
            return rollNumber;
        }

        public void setRollNumber(String rollNumber) {
            this.rollNumber = rollNumber;
        }

        public List<Cell> getCells() {
            return cells;
        }

        public void setCells(List<Cell> cells) {
            this.cells = cells;
        }
    }

    public static class Cell {
        private Long subjectId;
        private Double theory; // entered value
        private Double practical; // entered value
        private Double total; // computed = theory+practical
        private Double maxTotal; // for validation/display

        public Long getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(Long subjectId) {
            this.subjectId = subjectId;
        }

        public Double getTheory() {
            return theory;
        }

        public void setTheory(Double theory) {
            this.theory = theory;
        }

        public Double getPractical() {
            return practical;
        }

        public void setPractical(Double practical) {
            this.practical = practical;
        }

        public Double getTotal() {
            return total;
        }

        public void setTotal(Double total) {
            this.total = total;
        }

        public Double getMaxTotal() {
            return maxTotal;
        }

        public void setMaxTotal(Double maxTotal) {
            this.maxTotal = maxTotal;
        }
    }
}
