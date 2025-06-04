package com.school.exam.model;

import com.school.common.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
