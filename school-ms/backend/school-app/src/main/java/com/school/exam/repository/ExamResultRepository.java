package com.school.exam.repository;

import com.school.exam.model.ExamResult;
import com.school.exam.model.ExamResult.ResultStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    List<ExamResult> findByExamId(Long examId);

    List<ExamResult> findByStudentId(Long studentId);

    Optional<ExamResult> findByExamIdAndStudentId(Long examId, Long studentId);

    List<ExamResult> findByExamIdAndStatus(Long examId, ResultStatus status);

    @Query("SELECT r FROM ExamResult r WHERE r.exam.id = ?1 AND r.student.grade = ?2")
    List<ExamResult> findByExamIdAndGrade(Long examId, Integer grade);

    @Query("SELECT r FROM ExamResult r WHERE r.exam.id = ?1 AND r.student.grade = ?2 AND r.student.section = ?3")
    List<ExamResult> findByExamIdAndGradeAndSection(Long examId, Integer grade, String section);
}