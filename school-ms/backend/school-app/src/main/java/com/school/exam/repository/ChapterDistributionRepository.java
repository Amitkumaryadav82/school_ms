package com.school.exam.repository;

import com.school.exam.model.ChapterDistribution;
import com.school.exam.model.QuestionSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChapterDistributionRepository extends JpaRepository<ChapterDistribution, Long> {
    List<ChapterDistribution> findByBlueprintId(Long blueprintId);

    List<ChapterDistribution> findByChapterName(String chapterName);

    List<ChapterDistribution> findByBlueprintIdAndQuestionType(Long blueprintId,
            QuestionSection.QuestionType questionType);

    List<ChapterDistribution> findByChapterNameAndBlueprintId(String chapterName, Long blueprintId);
      /**
     * Find ChapterDistribution by chapter ID
     * This is a compatibility method that redirects to findByChapterName
     * using chapter ID to find chapter name first
     * 
     * @param chapterId The chapter ID
     * @return List of ChapterDistribution objects
     */
    @Query("SELECT cd FROM ChapterDistribution cd WHERE cd.chapterName IN " +
           "(SELECT c.name FROM com.school.course.model.Chapter c WHERE c.id = :chapterId)")
    List<ChapterDistribution> findByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * Find ChapterDistribution by chapter ID and blueprint ID
     * This is a compatibility method that redirects to findByChapterNameAndBlueprintId
     * using chapter ID to find chapter name first
     * 
     * @param chapterId The chapter ID
     * @param blueprintId The blueprint ID
     * @return List of ChapterDistribution objects
     */
    @Query("SELECT cd FROM ChapterDistribution cd WHERE cd.blueprint.id = :blueprintId AND cd.chapterName IN " +
           "(SELECT c.name FROM com.school.course.model.Chapter c WHERE c.id = :chapterId)")
    List<ChapterDistribution> findByChapterIdAndBlueprintId(@Param("chapterId") Long chapterId, @Param("blueprintId") Long blueprintId);
}
