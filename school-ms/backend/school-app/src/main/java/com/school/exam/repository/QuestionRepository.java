package com.school.exam.repository;

import com.school.exam.model.Question;
import com.school.exam.model.QuestionSection.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuestionPaperId(Long questionPaperId);

    List<Question> findByChapterId(Long chapterId);

    List<Question> findByQuestionType(QuestionType questionType);

    List<Question> findByQuestionPaperIdAndSectionNumber(Long questionPaperId, Integer sectionNumber);

    List<Question> findByQuestionPaperIdAndQuestionType(Long questionPaperId, QuestionType questionType);

    List<Question> findByQuestionPaperIdAndIsCompulsory(Long questionPaperId, Boolean isCompulsory);

    List<Question> findByChapterIdAndQuestionPaperId(Long chapterId, Long questionPaperId);
}
