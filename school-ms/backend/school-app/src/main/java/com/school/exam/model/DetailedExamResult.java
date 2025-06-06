package com.school.exam.model;

import com.school.common.model.BaseEntity;
import com.school.student.model.Student;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "detailed_exam_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailedExamResult extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "exam_result_id", nullable = false)
    private ExamResult examResult;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @NotNull
    private Double marksObtained;

    @Column(length = 1000)
    private String teacherRemarks;

    @NotNull
    private Boolean isPartialMarking;

    @Column(nullable = false)
    private Long markedBy;

    @Column(nullable = false)
    private java.time.LocalDateTime markedAt;

    @NotNull
    private Boolean isLocked;

    private Long lockedBy;

    private java.time.LocalDateTime lockedAt;

    @NotNull
    private Boolean isReviewed;

    private Long reviewedBy;

    private java.time.LocalDateTime reviewedAt;
}

