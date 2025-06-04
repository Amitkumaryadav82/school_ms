package com.school.exam.repository;

import com.school.exam.model.DetailedExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DetailedExamResultRepository extends JpaRepository<DetailedExamResult, Long> {
       List<DetailedExamResult> findByExamResultId(Long examResultId);

       List<DetailedExamResult> findByQuestionId(Long questionId);

       Optional<DetailedExamResult> findByExamResultIdAndQuestionId(Long examResultId, Long questionId);

       List<DetailedExamResult> findByMarkedBy(Long userId);

       List<DetailedExamResult> findByIsLocked(Boolean isLocked);

       List<DetailedExamResult> findByIsLockedAndLockedBy(Boolean isLocked, Long userId);

       List<DetailedExamResult> findByIsReviewed(Boolean isReviewed);

       List<DetailedExamResult> findByIsReviewedAndReviewedBy(Boolean isReviewed, Long userId);

       @Query("SELECT der FROM DetailedExamResult der JOIN der.examResult er JOIN er.exam e " +
                     "WHERE e.id = :examId")
       List<DetailedExamResult> findByExamId(Long examId);

       @Query("SELECT der FROM DetailedExamResult der JOIN der.question q JOIN q.chapter c " +
                     "WHERE c.id = :chapterId")
       List<DetailedExamResult> findByChapterId(Long chapterId);
}
