package com.school.exam.repository;

import com.school.exam.model.ExamMarkSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamMarkSummaryRepository extends JpaRepository<ExamMarkSummary, Long> {
    Optional<ExamMarkSummary> findByExamIdAndSubjectIdAndStudentId(Long examId, Long subjectId, Long studentId);

    List<ExamMarkSummary> findByExamIdAndSubjectIdAndClassId(Long examId, Long subjectId, Long classId);
}
