package com.school.exam.model;

import com.school.common.model.BaseEntity;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "exam_configurations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamConfiguration extends BaseEntity {

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    private String subject;

    @NotNull
    private Integer grade;

    @NotNull
    private Double theoryMaxMarks;

    @NotNull
    private Double practicalMaxMarks;

    @NotNull
    private Double passingPercentage;

    @Enumerated(EnumType.STRING)
    private Exam.ExamType examType;

    private String description;

    private Boolean isActive;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "paper_structure_id")
    private QuestionPaperStructure questionPaperStructure;

    @NotNull
    private Boolean requiresApproval;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;

    @NotNull
    private Integer academicYear;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }

    /**
     * Returns this instance, used as a convenience method to avoid null checks in code that expects 
     * a nested structure but is working directly with this class
     * @return this ExamConfiguration instance
     */
    public ExamConfiguration getExamConfiguration() {
        return this;
    }
    
    /**
     * Get the ID of the associated exam
     * @return ID of the exam or null if no exam is associated
     */
    public Long getExamId() {
        return exam != null ? exam.getId() : null;
    }
}

