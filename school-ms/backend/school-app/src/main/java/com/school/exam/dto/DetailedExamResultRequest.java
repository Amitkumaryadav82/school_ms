package com.school.exam.dto;

import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DetailedExamResultRequest {
    @NotNull
    private Long examResultId;

    @NotNull
    private Long questionId;

    @NotNull
    private Double marksObtained;

    private String teacherRemarks;

    @NotNull
    private Boolean isPartialMarking = false;
}

