package com.school.course.service;

import com.school.course.model.Course;
import com.school.course.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public CourseServiceImpl(CourseRepository courseRepository, JdbcTemplate jdbcTemplate) {
        this.courseRepository = courseRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));
    }

    @Override
    @Transactional
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    @Override
    @Transactional
    public Course updateCourse(Long id, Course course) {
        Course existingCourse = getCourseById(id);

        existingCourse.setName(course.getName());
        existingCourse.setDepartment(course.getDepartment());
        existingCourse.setTeacherId(course.getTeacherId());
        existingCourse.setCredits(course.getCredits());
        existingCourse.setCapacity(course.getCapacity());

        courseRepository.update(existingCourse);
        return existingCourse;
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        // First check if course exists
        getCourseById(id);

        // Delete all enrollments for this course
        jdbcTemplate.update("DELETE FROM enrollments WHERE course_id = ?", id);

        // Delete the course
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
    public void enrollStudent(Long courseId, Long studentId) {
        Course course = getCourseById(courseId);

        // Check if student is already enrolled
        int count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM enrollments WHERE course_id = ? AND student_id = ?",
                Integer.class, courseId, studentId);

        if (count > 0) {
            throw new IllegalStateException("Student is already enrolled in this course");
        }

        // Check if course is at capacity
        if (course.getEnrolled() >= course.getCapacity()) {
            throw new IllegalStateException("Course has reached maximum capacity");
        }

        // Enroll student
        jdbcTemplate.update(
                "INSERT INTO enrollments (course_id, student_id, created_at) VALUES (?, ?, NOW())",
                courseId, studentId);

        // Update enrolled count
        course.setEnrolled(course.getEnrolled() + 1);
        courseRepository.update(course);
    }

    @Override
    @Transactional
    public void unenrollStudent(Long courseId, Long studentId) {
        Course course = getCourseById(courseId);

        // Check if student is enrolled
        int count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM enrollments WHERE course_id = ? AND student_id = ?",
                Integer.class, courseId, studentId);

        if (count == 0) {
            throw new IllegalStateException("Student is not enrolled in this course");
        }

        // Unenroll student
        int rowsAffected = jdbcTemplate.update(
                "DELETE FROM enrollments WHERE course_id = ? AND student_id = ?",
                courseId, studentId);

        if (rowsAffected > 0) {
            // Update enrolled count
            course.setEnrolled(course.getEnrolled() - 1);
            courseRepository.update(course);
        }
    }
}