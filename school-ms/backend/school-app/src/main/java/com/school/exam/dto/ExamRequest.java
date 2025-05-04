package com.school.exam.dto;

import com.school.exam.model.Exam.ExamType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExamRequest {
    @NotBlank
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

    @NotNull
    private ExamType examType;
}