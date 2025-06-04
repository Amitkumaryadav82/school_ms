package com.school.exam.model;

import com.school.common.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "chapter_distributions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChapterDistribution extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "blueprint_id", nullable = false)
    private ExamBlueprint blueprint;

    @NotNull
    private String chapterName;

    @Enumerated(EnumType.STRING)
    private QuestionSection.QuestionType questionType;

    @NotNull
    private Integer questionCount;

    @NotNull
    private Double totalMarks;

    @NotNull
    private Double weightagePercentage;
}
