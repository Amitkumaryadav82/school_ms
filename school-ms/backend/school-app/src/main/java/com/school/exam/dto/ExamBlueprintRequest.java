package com.school.exam.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ExamBlueprintRequest {
    @NotNull
    private String name;

    @NotNull
    private String description;

    @NotNull
    private Long examConfigurationId;

    @NotNull
    private Long paperStructureId;

    private List<ChapterDistributionRequest> chapterDistributions;

    private String comments;
}
