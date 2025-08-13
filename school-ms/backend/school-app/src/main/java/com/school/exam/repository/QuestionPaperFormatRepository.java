package com.school.exam.repository;

import com.school.exam.model.QuestionPaperFormat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionPaperFormatRepository extends JpaRepository<QuestionPaperFormat, Long> {
    List<QuestionPaperFormat> findByExamIdAndClassIdAndSubjectId(Long examId, Long classId, Long subjectId);

    @Query("select distinct q.subjectId from QuestionPaperFormat q where q.examId = :examId and q.classId = :classId")
    List<Long> findDistinctSubjectIdsByExamIdAndClassId(@Param("examId") Long examId, @Param("classId") Long classId);
}
