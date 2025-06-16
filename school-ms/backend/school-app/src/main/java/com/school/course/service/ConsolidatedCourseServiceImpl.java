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
        // Set default values if needed
        if (course.getEnrolled() == null) {
            course.setEnrolled(0);
        }
        
        // Set audit timestamps
        LocalDateTime now = LocalDateTime.now();
        course.setCreatedAt(now);
        course.setUpdatedAt(now);
        
        return courseRepository.save(course);
    }

    @Override
    @Transactional
    public ConsolidatedCourse updateCourse(Long id, ConsolidatedCourse course) {
        // Verify course exists
        ConsolidatedCourse existingCourse = getCourseById(id);
        
        // Update fields
        existingCourse.setName(course.getName());
        existingCourse.setDepartment(course.getDepartment());
        existingCourse.setTeacherId(course.getTeacherId());
        existingCourse.setCredits(course.getCredits());
        existingCourse.setCapacity(course.getCapacity());
        
        // Only update enrolled if provided
        if (course.getEnrolled() != null) {
            existingCourse.setEnrolled(course.getEnrolled());
        }
        
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
        return courseRepository.findByDepartment(department);
    }

    @Override
    public List<ConsolidatedCourse> getCoursesByTeacherId(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }
}
