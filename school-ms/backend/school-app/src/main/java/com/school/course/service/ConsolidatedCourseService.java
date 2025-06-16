package com.school.course.service;

import com.school.course.model.ConsolidatedCourse;
import java.util.List;

/**
 * Consolidated Course service that combines functionality from both previous implementations.
 * This combines features from:
 * - com.schoolms.service.CourseService
 * - com.school.course.service.CourseService
 */
public interface ConsolidatedCourseService {
    /**
     * Get all courses in the system
     * 
     * @return List of all courses
     */
    List<ConsolidatedCourse> getAllCourses();

    /**
     * Get course by ID
     * 
     * @param id Course ID
     * @return Course if found, throws exception if not found
     */
    ConsolidatedCourse getCourseById(Long id);

    /**
     * Create a new course
     * 
     * @param course Course to create
     * @return Created course with ID
     */
    ConsolidatedCourse createCourse(ConsolidatedCourse course);

    /**
     * Update an existing course
     * 
     * @param id Course ID to update
     * @param course Updated course information
     * @return Updated course
     */
    ConsolidatedCourse updateCourse(Long id, ConsolidatedCourse course);

    /**
     * Delete a course
     * 
     * @param id Course ID to delete
     */
    void deleteCourse(Long id);

    /**
     * Get courses by department
     * 
     * @param department Department name
     * @return List of courses in the department
     */
    List<ConsolidatedCourse> getCoursesByDepartment(String department);

    /**
     * Get courses by teacher
     * 
     * @param teacherId Teacher ID
     * @return List of courses taught by the teacher
     */
    List<ConsolidatedCourse> getCoursesByTeacherId(Long teacherId);
}
