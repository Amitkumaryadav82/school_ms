package com.school.exam.dto;

import com.school.exam.model.QuestionPaper;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class QuestionPaperRequest {
    @NotNull
    private String title;

    @NotNull
    private Long examId;

    private Long blueprintId;

    private List<QuestionRequest> questions;

    @NotNull
    private Integer timeAllotted;

    private String comments;
}
