package com.school.exam.model;

import com.school.common.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
}