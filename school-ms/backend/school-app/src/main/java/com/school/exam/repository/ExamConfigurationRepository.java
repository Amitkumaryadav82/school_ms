package com.school.exam.repository;

import com.school.exam.model.ExamConfiguration;
import com.school.exam.model.Exam.ExamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamConfigurationRepository extends JpaRepository<ExamConfiguration, Long> {
    List<ExamConfiguration> findBySubject(String subject);

    List<ExamConfiguration> findByGrade(Integer grade);

    List<ExamConfiguration> findByExamType(ExamType examType);

    List<ExamConfiguration> findByGradeAndSubject(Integer grade, String subject);

    List<ExamConfiguration> findByGradeAndExamType(Integer grade, ExamType examType);

    List<ExamConfiguration> findBySubjectAndExamType(String subject, ExamType examType);

    List<ExamConfiguration> findByGradeAndSubjectAndExamType(Integer grade, String subject, ExamType examType);

    List<ExamConfiguration> findByAcademicYear(Integer academicYear);

    List<ExamConfiguration> findByIsActive(Boolean isActive);
}
