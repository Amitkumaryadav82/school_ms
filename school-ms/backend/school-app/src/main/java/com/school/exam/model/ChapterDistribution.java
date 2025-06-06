package com.school.exam.model;

import com.school.common.model.BaseEntity;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
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

    /**
     * Get the chapter associated with this distribution
     * @return the chapter name as a String
     */
    public String getChapter() {
        return this.chapterName;
    }
    
    /**
     * Set the chapter for this distribution 
     * @param chapter the chapter object to be associated
     */
    public void setChapter(com.school.course.model.Chapter chapter) {
        if (chapter != null) {
            this.chapterName = chapter.getName();
        }
    }
}

