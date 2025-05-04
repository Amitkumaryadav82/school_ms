package com.school.exam.repository;

import com.school.exam.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByGrade(Integer grade);

    List<Exam> findBySubject(String subject);

    List<Exam> findByExamDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<Exam> findByGradeAndSubject(Integer grade, String subject);
}