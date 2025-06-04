package com.school.exam.dto;

import com.school.exam.model.QuestionSection;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class QuestionPaperStructureRequest {
    @NotNull
    private String name;

    @NotNull
    private Integer totalQuestions;

    @NotNull
    private Integer mandatoryQuestions;

    @NotNull
    private Integer optionalQuestions;

    @NotNull
    private Double totalMarks;

    private List<QuestionSectionRequest> sections;
}
