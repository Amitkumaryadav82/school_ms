package com.school.exam.repository;

import com.school.exam.model.Question;
import com.school.exam.model.QuestionSection.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuestionPaperId(Long questionPaperId);    List<Question> findByChapterName(String chapterName);

    List<Question> findByQuestionType(QuestionType questionType);

    List<Question> findByQuestionPaperIdAndSectionNumber(Long questionPaperId, Integer sectionNumber);

    List<Question> findByQuestionPaperIdAndQuestionType(Long questionPaperId, QuestionType questionType);

    List<Question> findByQuestionPaperIdAndIsCompulsory(Long questionPaperId, Boolean isCompulsory);

    List<Question> findByChapterNameAndQuestionPaperId(String chapterName, Long questionPaperId);
    
    /**
     * Find questions by chapter ID
     * @param chapterId The ID of the chapter
     * @return List of questions for the given chapter ID
     */
    @Query("SELECT q FROM Question q WHERE q.chapterName IN " +
           "(SELECT c.name FROM com.school.course.model.Chapter c WHERE c.id = :chapterId)")
    List<Question> findByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * Find questions by chapter ID and question paper ID
     * @param chapterId The ID of the chapter
     * @param questionPaperId The ID of the question paper
     * @return List of questions for the given chapter ID and question paper ID
     */
    @Query("SELECT q FROM Question q WHERE q.questionPaper.id = :questionPaperId AND q.chapterName IN " +
           "(SELECT c.name FROM com.school.course.model.Chapter c WHERE c.id = :chapterId)")
    List<Question> findByChapterIdAndQuestionPaperId(@Param("chapterId") Long chapterId, @Param("questionPaperId") Long questionPaperId);
}
