package com.school.exam.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_mark_details", uniqueConstraints = @UniqueConstraint(columnNames = {"summary_id","question_format_id"}))
public class ExamMarkDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "summary_id", nullable = false)
    private ExamMarkSummary summary;

    @Column(name = "question_format_id", nullable = false)
    private Long questionFormatId; // QuestionPaperFormat.id

    @Column(name = "question_number", nullable = false)
    private Integer questionNumber;

    @Column(name = "unit_name")
    private String unitName;

    @Column(name = "question_type")
    private String questionType; // THEORY or PRACTICAL

    @Column(name = "max_marks", nullable = false)
    private Double maxMarks;

    @Column(name = "obtained_marks")
    private Double obtainedMarks;

    @Column(name = "evaluator_comments")
    private String evaluatorComments;

    @Column(name = "last_edit_reason")
    private String lastEditReason;

    @Column(name = "last_edit_at")
    private LocalDateTime lastEditAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ExamMarkSummary getSummary() { return summary; }
    public void setSummary(ExamMarkSummary summary) { this.summary = summary; }
    public Long getQuestionFormatId() { return questionFormatId; }
    public void setQuestionFormatId(Long questionFormatId) { this.questionFormatId = questionFormatId; }
    public Integer getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(Integer questionNumber) { this.questionNumber = questionNumber; }
    public String getUnitName() { return unitName; }
    public void setUnitName(String unitName) { this.unitName = unitName; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public Double getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }
    public Double getObtainedMarks() { return obtainedMarks; }
    public void setObtainedMarks(Double obtainedMarks) { this.obtainedMarks = obtainedMarks; }
    public String getEvaluatorComments() { return evaluatorComments; }
    public void setEvaluatorComments(String evaluatorComments) { this.evaluatorComments = evaluatorComments; }
    public String getLastEditReason() { return lastEditReason; }
    public void setLastEditReason(String lastEditReason) { this.lastEditReason = lastEditReason; }
    public LocalDateTime getLastEditAt() { return lastEditAt; }
    public void setLastEditAt(LocalDateTime lastEditAt) { this.lastEditAt = lastEditAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
