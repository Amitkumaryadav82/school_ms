package com.school.exam.repository;

import com.school.exam.model.ExamConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamConfigRepository extends JpaRepository<ExamConfig, Long> {
    List<ExamConfig> findBySchoolClassId(Long classId);
}
