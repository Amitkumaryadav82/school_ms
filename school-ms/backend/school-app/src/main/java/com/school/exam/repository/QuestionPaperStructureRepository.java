package com.school.exam.repository;

import com.school.exam.model.QuestionPaperStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionPaperStructureRepository extends JpaRepository<QuestionPaperStructure, Long> {
    List<QuestionPaperStructure> findByExamConfigurationId(Long examConfigurationId);

    Optional<QuestionPaperStructure> findByName(String name);
}
