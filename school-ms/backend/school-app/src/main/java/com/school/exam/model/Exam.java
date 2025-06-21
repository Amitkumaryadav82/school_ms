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
    // The getId() method is inherited from BaseEntity via @Getter
    
    /**
     * Explicit getId() method to ensure it's visible to the compiler
     * @return the ID of the exam
     */
    public Long getId() {
        return super.getId();
    }
    
    /**
     * Static builder method to create a new ExamBuilder instance
     * @return a new ExamBuilder
     */
    public static ExamBuilder builder() {
        return new ExamBuilder();
    }
    
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
      // The getId() method is already inherited from BaseEntity
    // No need to override it here
      // ID field is inherited from BaseEntity and accessible via getId()/setId() from BaseEntity
}
