package com.school.exam.dto;

import com.school.exam.model.QuestionSection;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionSectionRequest {
    @NotNull
    private String sectionName;

    @NotNull
    private Integer questionCount;

    @NotNull
    private Double marksPerQuestion;

    @NotNull
    private Boolean isMandatory;

    @NotNull
    private QuestionSection.QuestionType questionType;
}
