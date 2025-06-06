package com.school.exam.dto;

import com.school.exam.model.QuestionSection;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChapterDistributionRequest {
    @NotNull
    private Long chapterId;

    @NotNull
    private QuestionSection.QuestionType questionType;

    @NotNull
    private Integer questionCount;

    @NotNull
    private Double totalMarks;

    @NotNull
    private Double weightagePercentage;
}

