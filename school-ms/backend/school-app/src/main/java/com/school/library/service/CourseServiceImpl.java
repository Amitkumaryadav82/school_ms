package com.school.library.service;

import com.school.library.model.Course;
import com.school.library.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

/**
 * Legacy library course service depending on deprecated course columns.
 * Disabled unless
 * property 'legacy.courses.enabled=true' is explicitly provided.
 */
@Service("libraryCourseService")
@ConditionalOnProperty(value = "legacy.courses.enabled", havingValue = "true")
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public CourseServiceImpl(@Qualifier("libraryCoursesRepositoryImpl") CourseRepository courseRepository,
            JdbcTemplate jdbcTemplate) {
        this.courseRepository = courseRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    @Override
    @Transactional
    public Course createCourse(Course course) {
        // Set default values for new course if not provided
        if (course.getCredits() <= 0) {
            course.setCredits(3); // Default credits
        }
        if (course.getCapacity() <= 0) {
            course.setCapacity(30); // Default capacity
        }

        // Set initial enrollment to 0 for new courses
        course.setEnrolled(0);

        return courseRepository.save(course);
    }

    @Override
    @Transactional
    public Course updateCourse(Long id, Course course) {
        return courseRepository.findById(id)
                .map(existingCourse -> {
                    // Update the existingCourse with values from course
                    existingCourse.setName(course.getName());
                    existingCourse.setDepartment(course.getDepartment());
                    existingCourse.setTeacherId(course.getTeacherId());
                    existingCourse.setCredits(course.getCredits());
                    existingCourse.setCapacity(course.getCapacity());

                    // Don't directly update enrolled count through update API
                    // This should happen through enrollment/unenrollment

                    courseRepository.update(existingCourse);
                    return existingCourse;
                })
                .orElseThrow(() -> new NoSuchElementException("Course not found with ID: " + id));
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        // Check if course exists before deleting
        courseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Course not found with ID: " + id));

        // First, remove all enrollments for this course
        jdbcTemplate.update("DELETE FROM enrollments WHERE course_id = ?", id);

        // Then delete the course
        courseRepository.delete(id);
    }

    @Override
    public List<Course> getCoursesByDepartment(String department) {
        return courseRepository.findByDepartment(department);
    }

    @Override
    public List<Course> getCoursesByTeacherId(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    @Override
    @Transactional
    public boolean enrollStudent(Long courseId, Long studentId) {
        // Check if course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NoSuchElementException("Course not found with ID: " + courseId));

        // Check if there's capacity in the course
        if (course.getEnrolled() >= course.getCapacity()) {
            return false; // Course is at capacity
        }

        // Check if student is already enrolled in this course
        int count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM enrollments WHERE student_id = ? AND course_id = ?",
                Integer.class, studentId, courseId);

        if (count > 0) {
            return false; // Already enrolled
        }

        // Enroll student
        jdbcTemplate.update(
                "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)",
                studentId, courseId);

        // Update enrolled count in course
        course.setEnrolled(course.getEnrolled() + 1);
        courseRepository.update(course);

        return true;
    }

    @Override
    @Transactional
    public boolean unenrollStudent(Long courseId, Long studentId) {
        // Check if course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NoSuchElementException("Course not found with ID: " + courseId));

        // Check if student is enrolled in this course
        int count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM enrollments WHERE student_id = ? AND course_id = ?",
                Integer.class, studentId, courseId);

        if (count == 0) {
            return false; // Not enrolled
        }

        // Remove enrollment
        jdbcTemplate.update(
                "DELETE FROM enrollments WHERE student_id = ? AND course_id = ?",
                studentId, courseId);

        // Update enrolled count in course
        course.setEnrolled(Math.max(0, course.getEnrolled() - 1)); // Ensure it doesn't go negative
        courseRepository.update(course);

        return true;
    }
}
