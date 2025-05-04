package com.school.exam.model;

import com.school.common.model.BaseEntity;
import com.school.student.model.Student;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "exam_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResult extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @NotNull
    private Double marksObtained;
    
    private String remarks;
    
    @Enumerated(EnumType.STRING)
    private ResultStatus status;
    
    public enum ResultStatus {
        PASS, FAIL, ABSENT, PENDING
    }
    
    @PrePersist
    @PreUpdate
    private void calculateStatus() {
        if (marksObtained >= exam.getPassingMarks()) {
            this.status = ResultStatus.PASS;
        } else {
            this.status = ResultStatus.FAIL;
        }
    }
}