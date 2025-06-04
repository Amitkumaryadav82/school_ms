package com.school.exam.model;

import com.school.common.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "question_sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionSection extends BaseEntity {

    @NotNull
    private String sectionName;

    @NotNull
    private Integer questionCount;

    @NotNull
    private Double marksPerQuestion;

    @NotNull
    private Boolean isMandatory;

    @Enumerated(EnumType.STRING)
    private QuestionType questionType;

    @ManyToOne
    @JoinColumn(name = "question_paper_structure_id")
    private QuestionPaperStructure questionPaperStructure;

    public enum QuestionType {
        MULTIPLE_CHOICE,
        SHORT_ANSWER,
        LONG_ANSWER,
        TRUE_FALSE,
        FILL_IN_BLANKS,
        PRACTICAL
    }
}
