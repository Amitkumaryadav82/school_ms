package com.school.exam.model;

import com.school.common.model.BaseEntity;
import com.school.student.model.Student;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import lombok.*;

/**
 * Entity for storing question-wise marks for a student's exam
 */
@Entity
@Table(name = "question_wise_marks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionWiseMarks extends BaseEntity {    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
    
    @NotNull
    private Double obtainedMarks;
    
    private String evaluatorComments;
    
    @NotNull
    private Boolean isAbsent = false;
    
    @Column(columnDefinition = "TEXT")
    private String absenceReason;
    
    @NotNull
    private Boolean isLocked = false;
    
    @Column(name = "locked_by")
    private Long lockedBy;
    
    @Column(name = "locked_at")
    private java.time.LocalDateTime lockedAt;
    
    // For tracking edits after locking
    private Boolean wasEdited = false;
    
    @Column(name = "edited_by")
    private Long editedBy;
    
    @Column(name = "edited_at")
    private java.time.LocalDateTime editedAt;
    
    @Column(name = "edit_reason", columnDefinition = "TEXT")
    private String editReason;
}

