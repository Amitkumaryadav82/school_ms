package com.school.exam.model;

import com.school.common.model.BaseEntity;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam extends BaseEntity {
    
    @NotBlank
    @Column(nullable = false)
    private String name;
    
    @NotBlank
    private String subject;
    
    @NotNull
    private Integer grade;
    
    @NotNull
    private LocalDateTime examDate;
    
    private String description;
    
    @NotNull
    private Double totalMarks;
    
    @NotNull
    private Double passingMarks;
    
    @Enumerated(EnumType.STRING)
    private ExamType examType;
    
    public enum ExamType {
        MIDTERM, FINAL, QUIZ, ASSIGNMENT
    }
    
    /**
     * Get the passing marks for the exam
     * @return the passing marks
     */
    public Double getPassingMarks() {
        return this.passingMarks;
    }
    
    /**
     * Get the ID of the exam
     * @return the exam ID
     */
    @Override
    public Long getId() {
        return super.getId();
    }
}
