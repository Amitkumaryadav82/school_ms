package com.school.exam.repository;

import com.school.exam.model.ExamMarkDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamMarkDetailRepository extends JpaRepository<ExamMarkDetail, Long> {
    List<ExamMarkDetail> findBySummaryId(Long summaryId);
}
