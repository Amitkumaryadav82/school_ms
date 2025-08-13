package com.school.exam.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_mark_summaries", uniqueConstraints = @UniqueConstraint(columnNames = {"exam_id","subject_id","student_id"}))
public class ExamMarkSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id", nullable = false)
    private Long examId;

    @Column(name = "class_id")
    private Long classId;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "is_absent")
    private Boolean isAbsent = false;

    @Column(name = "absence_reason")
    private String absenceReason;

    @Column(name = "total_theory_marks")
    private Double totalTheoryMarks;

    @Column(name = "total_practical_marks")
    private Double totalPracticalMarks;

    @Column(name = "locked")
    private Boolean locked = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }
    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Boolean getIsAbsent() { return isAbsent; }
    public void setIsAbsent(Boolean absent) { isAbsent = absent; }
    public String getAbsenceReason() { return absenceReason; }
    public void setAbsenceReason(String absenceReason) { this.absenceReason = absenceReason; }
    public Double getTotalTheoryMarks() { return totalTheoryMarks; }
    public void setTotalTheoryMarks(Double totalTheoryMarks) { this.totalTheoryMarks = totalTheoryMarks; }
    public Double getTotalPracticalMarks() { return totalPracticalMarks; }
    public void setTotalPracticalMarks(Double totalPracticalMarks) { this.totalPracticalMarks = totalPracticalMarks; }
    public Boolean getLocked() { return locked; }
    public void setLocked(Boolean locked) { this.locked = locked; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
