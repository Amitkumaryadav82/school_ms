package com.school.exam.repository;

import com.school.exam.model.ChapterDistribution;
import com.school.exam.model.QuestionSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChapterDistributionRepository extends JpaRepository<ChapterDistribution, Long> {
    List<ChapterDistribution> findByBlueprintId(Long blueprintId);

    List<ChapterDistribution> findByChapterId(Long chapterId);

    List<ChapterDistribution> findByBlueprintIdAndQuestionType(Long blueprintId,
            QuestionSection.QuestionType questionType);

    List<ChapterDistribution> findByChapterIdAndBlueprintId(Long chapterId, Long blueprintId);
}
