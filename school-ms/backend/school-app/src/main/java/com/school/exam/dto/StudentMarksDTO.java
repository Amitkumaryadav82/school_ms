package com.school.exam.dto;

import java.util.List;

public class StudentMarksDTO {
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private Long examId;
    private Long subjectId;
    private String subjectName;
    private boolean isAbsent;
    private String absenceReason;
    private List<QuestionMarkDTO> questionMarks;
    private Double totalTheoryMarks;
    private Double maxTheoryMarks;
    private Double totalPracticalMarks;
    private Double maxPracticalMarks;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public boolean isAbsent() { return isAbsent; }
    public void setAbsent(boolean absent) { isAbsent = absent; }
    public String getAbsenceReason() { return absenceReason; }
    public void setAbsenceReason(String absenceReason) { this.absenceReason = absenceReason; }
    public List<QuestionMarkDTO> getQuestionMarks() { return questionMarks; }
    public void setQuestionMarks(List<QuestionMarkDTO> questionMarks) { this.questionMarks = questionMarks; }
    public Double getTotalTheoryMarks() { return totalTheoryMarks; }
    public void setTotalTheoryMarks(Double totalTheoryMarks) { this.totalTheoryMarks = totalTheoryMarks; }
    public Double getMaxTheoryMarks() { return maxTheoryMarks; }
    public void setMaxTheoryMarks(Double maxTheoryMarks) { this.maxTheoryMarks = maxTheoryMarks; }
    public Double getTotalPracticalMarks() { return totalPracticalMarks; }
    public void setTotalPracticalMarks(Double totalPracticalMarks) { this.totalPracticalMarks = totalPracticalMarks; }
    public Double getMaxPracticalMarks() { return maxPracticalMarks; }
    public void setMaxPracticalMarks(Double maxPracticalMarks) { this.maxPracticalMarks = maxPracticalMarks; }
}
