package com.school.course.service;

import com.school.course.model.ConsolidatedCourse;
import com.school.course.repository.ConsolidatedCourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * Consolidated Course service implementation that combines functionality
 * from both previous implementations.
 * This combines features from:
 * - com.schoolms.service.CourseServiceImpl
 * - com.school.course.service.CourseServiceImpl
 */
@Service
public class ConsolidatedCourseServiceImpl implements ConsolidatedCourseService {

    private final ConsolidatedCourseRepository courseRepository;

    @Autowired
    public ConsolidatedCourseServiceImpl(ConsolidatedCourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public List<ConsolidatedCourse> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public ConsolidatedCourse getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Course not found with ID: " + id));
    }

    @Override
    @Transactional
    public ConsolidatedCourse createCourse(ConsolidatedCourse course) {
        // Set audit timestamps
        LocalDateTime now = LocalDateTime.now();
        course.setCreatedAt(now);
        course.setUpdatedAt(now);
        if (course.getIsActive() == null) {
            course.setIsActive(Boolean.TRUE);
        }
        return courseRepository.save(course);
    }

    @Override
    @Transactional
    public ConsolidatedCourse updateCourse(Long id, ConsolidatedCourse course) {
        // Verify course exists
        ConsolidatedCourse existingCourse = getCourseById(id);

        // Update fields
        existingCourse.setCourseCode(course.getCourseCode());
        existingCourse.setName(course.getName());
        existingCourse.setDescription(course.getDescription());
        existingCourse.setCategory(course.getCategory());
        existingCourse.setIsActive(course.getIsActive());

        // Update timestamp
        existingCourse.setUpdatedAt(LocalDateTime.now());

        return courseRepository.save(existingCourse);
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        // Verify course exists
        getCourseById(id);

        // Delete the course
        courseRepository.deleteById(id);
    }

    @Override
    public List<ConsolidatedCourse> getCoursesByDepartment(String department) {
        // Deprecated: department field is not present in consolidated schema
        throw new UnsupportedOperationException("Filtering by department is not supported in current schema");
    }

    @Override
    public List<ConsolidatedCourse> getCoursesByTeacherId(Long teacherId) {
        // Deprecated: teacherId field is not present in consolidated schema
        throw new UnsupportedOperationException("Filtering by teacherId is not supported in current schema");
    }
}
