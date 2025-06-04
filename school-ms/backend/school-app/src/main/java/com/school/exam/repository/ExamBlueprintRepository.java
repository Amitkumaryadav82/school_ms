package com.school.exam.repository;

import com.school.exam.model.ExamBlueprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamBlueprintRepository extends JpaRepository<ExamBlueprint, Long> {
    List<ExamBlueprint> findByExamConfigurationId(Long examConfigurationId);

    List<ExamBlueprint> findByIsApproved(Boolean isApproved);

    Optional<ExamBlueprint> findByNameAndExamConfigurationId(String name, Long examConfigurationId);

    List<ExamBlueprint> findByExamConfigurationIdAndIsApproved(Long examConfigurationId, Boolean isApproved);
}
