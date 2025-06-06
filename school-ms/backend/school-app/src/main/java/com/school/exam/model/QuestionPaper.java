package com.school.exam.model;

import com.school.common.model.BaseEntity;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "question_papers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionPaper extends BaseEntity {

    @NotNull
    private String title;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "blueprint_id")
    private ExamBlueprint blueprint;

    @OneToMany(mappedBy = "questionPaper", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Question> questions;

    @Column(nullable = false)
    private Long createdBy;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;

    private Long approvedBy;

    private java.time.LocalDateTime approvalDate;

    private String comments;

    @NotNull
    private Integer timeAllotted; // in minutes

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}

