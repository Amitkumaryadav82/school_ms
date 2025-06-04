package com.school.exam.repository;

import com.school.exam.model.QuestionSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionSectionRepository extends JpaRepository<QuestionSection, Long> {
    List<QuestionSection> findByQuestionPaperStructureId(Long questionPaperStructureId);

    List<QuestionSection> findByQuestionType(QuestionSection.QuestionType questionType);

    List<QuestionSection> findByIsMandatory(Boolean isMandatory);

    List<QuestionSection> findByQuestionPaperStructureIdAndQuestionType(
            Long questionPaperStructureId,
            QuestionSection.QuestionType questionType);
}
