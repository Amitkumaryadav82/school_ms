package com.school.course.repository;

import com.school.course.model.ConsolidatedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Consolidated Course repository that combines functionality from both previous
 * implementations.
 * This combines features from:
 * - com.schoolms.repository.CourseRepository
 * - com.school.course.repository.CourseRepository
 */
@Repository
public interface ConsolidatedCourseRepository extends JpaRepository<ConsolidatedCourse, Long> {
}
