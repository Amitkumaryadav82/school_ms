package com.school.exam.model;

import com.school.common.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "question_paper_structures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionPaperStructure extends BaseEntity {

    @NotNull
    @Column(nullable = false)
    private String name;

    @NotNull
    private Integer totalQuestions;

    @NotNull
    private Integer mandatoryQuestions;

    @NotNull
    private Integer optionalQuestions;

    @NotNull
    private Double totalMarks;

    @ManyToOne
    @JoinColumn(name = "exam_configuration_id")
    private ExamConfiguration examConfiguration;

    @OneToMany(mappedBy = "questionPaperStructure", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<QuestionSection> sections;
}
