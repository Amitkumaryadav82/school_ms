package com.school.exam.repository;

import com.school.exam.model.QuestionPaperFormat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionPaperFormatRepository extends JpaRepository<QuestionPaperFormat, Long> {
    List<QuestionPaperFormat> findByExamIdAndClassIdAndSubjectId(Long examId, Long classId, Long subjectId);
}
