package com.school.exam.dto;

import com.school.exam.model.QuestionSection;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionRequest {
    @NotNull
    private String questionText;

    private Long chapterId;
    
    private String chapterName;

    @NotNull
    private Double marks;

    @NotNull
    private QuestionSection.QuestionType questionType;

    @NotNull
    private Integer sectionNumber;

    @NotNull
    private Integer questionNumber;

    private Boolean isCompulsory;

    private String answerKey;

    private String markingScheme;
}
