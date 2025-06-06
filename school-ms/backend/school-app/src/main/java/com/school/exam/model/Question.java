package com.school.exam.model;

import com.school.common.model.BaseEntity;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question extends BaseEntity {

    @NotNull
    @Column(length = 1000)
    private String questionText;

    @ManyToOne
    @JoinColumn(name = "question_paper_id")
    private QuestionPaper questionPaper;

    @NotNull
    private String chapterName;

    @NotNull
    private Double marks;

    @Enumerated(EnumType.STRING)
    private QuestionSection.QuestionType questionType;

    @NotNull
    private Integer sectionNumber;

    @NotNull
    private Integer questionNumber;

    private Boolean isCompulsory;

    @Column(length = 2000)
    private String answerKey;

    @Column(length = 1000)
    private String markingScheme;
      /**
     * Get the chapter based on the chapter name
     * @return chapter name as String
     */
    public String getChapter() {
        return this.chapterName;
    }
    
    /**
     * Set the chapter for this question
     * @param chapter the chapter object to be associated
     */
    public void setChapter(com.school.course.model.Chapter chapter) {
        if (chapter != null) {
            this.chapterName = chapter.getName();
        }
    }
}

