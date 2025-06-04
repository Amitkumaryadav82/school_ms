package com.school.exam.repository;

import com.school.exam.model.QuestionWiseMarks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionWiseMarksRepository extends JpaRepository<QuestionWiseMarks, Long> {
    
    List<QuestionWiseMarks> findByStudentIdAndExamId(Long studentId, Long examId);
    
    List<QuestionWiseMarks> findByExamId(Long examId);
    
    @Query("SELECT qwm FROM QuestionWiseMarks qwm WHERE qwm.exam.id = :examId AND qwm.question.id IN " +
           "(SELECT q.id FROM Question q WHERE q.chapterName = :chapterName)")
    List<QuestionWiseMarks> findByExamIdAndChapter(Long examId, String chapterName);
    
    @Query("SELECT AVG(qwm.obtainedMarks / q.marks * 100) FROM QuestionWiseMarks qwm " +
           "JOIN qwm.question q WHERE qwm.exam.id = :examId AND q.chapterName = :chapterName")
    Double getAverageScorePercentageByChapter(Long examId, String chapterName);
}
