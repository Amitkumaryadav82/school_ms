package com.school.exam.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExamResultRequest {
    @NotNull
    private Long examId;

    @NotNull
    private Long studentId;

    @NotNull
    private Double marksObtained;

    private String remarks;
}