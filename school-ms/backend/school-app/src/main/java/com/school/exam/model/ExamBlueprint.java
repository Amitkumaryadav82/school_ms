package com.school.exam.model;

import com.school.common.model.BaseEntity;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "exam_blueprints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamBlueprint extends BaseEntity {

    @NotNull
    private String name;

    @NotNull
    private String description;

    @ManyToOne
    @JoinColumn(name = "exam_configuration_id", nullable = false)
    private ExamConfiguration examConfiguration;

    @ManyToOne
    @JoinColumn(name = "paper_structure_id", nullable = false)
    private QuestionPaperStructure paperStructure;

    @OneToMany(mappedBy = "blueprint", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ChapterDistribution> chapterDistributions;

    @NotNull
    private Boolean isApproved;

    @Column(nullable = false)
    private Long approvedBy;

    @Column(nullable = false)
    private java.time.LocalDateTime approvalDate;

    private String comments;
}

