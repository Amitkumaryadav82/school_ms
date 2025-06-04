package com.school.exam.repository;

import com.school.exam.model.QuestionPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionPaperRepository extends JpaRepository<QuestionPaper, Long> {
    List<QuestionPaper> findByExamId(Long examId);

    List<QuestionPaper> findByBlueprintId(Long blueprintId);

    List<QuestionPaper> findByCreatedBy(Long userId);

    List<QuestionPaper> findByApprovalStatus(QuestionPaper.ApprovalStatus status);

    Optional<QuestionPaper> findByExamIdAndApprovalStatus(Long examId, QuestionPaper.ApprovalStatus status);
}
