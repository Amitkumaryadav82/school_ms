package com.school.exam.dto;

import com.school.exam.model.Exam;
import com.school.exam.model.ExamConfiguration;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ExamConfigurationRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String subject;

    @NotNull
    private Integer grade;

    @NotNull
    private Double theoryMaxMarks;

    @NotNull
    private Double practicalMaxMarks;

    @NotNull
    private Double passingPercentage;

    @NotNull
    private Exam.ExamType examType;

    private String description;

    private Boolean isActive = true;

    @NotNull
    private Boolean requiresApproval;

    @NotNull
    private Integer academicYear;

    private QuestionPaperStructureRequest paperStructure;
}
