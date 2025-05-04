package com.school.course.repository;

import com.school.course.model.Course;
import java.util.List;
import java.util.Optional;

public interface CourseRepository {
    List<Course> findAll();

    Optional<Course> findById(Long id);

    List<Course> findByDepartment(String department);

    List<Course> findByTeacherId(Long teacherId);

    Course save(Course course);

    void deleteById(Long id);

    boolean existsById(Long id);

    List<Course> findAvailableCourses();

    void update(Course course);

    void delete(Long id);
}