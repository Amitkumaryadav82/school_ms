package com.school.course.repository;

import com.school.course.model.ConsolidatedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Consolidated Course repository that combines functionality from both previous implementations.
 * This combines features from:
 * - com.schoolms.repository.CourseRepository
 * - com.school.course.repository.CourseRepository
 */
@Repository
public interface ConsolidatedCourseRepository extends JpaRepository<ConsolidatedCourse, Long> {
    
    /**
     * Find courses by department
     * 
     * @param department Department name
     * @return List of courses in the department
     */
    List<ConsolidatedCourse> findByDepartment(String department);
    
    /**
     * Find courses by teacher ID
     * 
     * @param teacherId Teacher ID
     * @return List of courses taught by the teacher
     */
    List<ConsolidatedCourse> findByTeacherId(Long teacherId);
}
