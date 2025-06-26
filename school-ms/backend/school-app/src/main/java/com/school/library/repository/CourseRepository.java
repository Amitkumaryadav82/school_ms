package com.school.library.repository;

import com.school.library.model.Course;
import java.util.List;
import java.util.Optional;

public interface CourseRepository {
    List<Course> findAll();

    Optional<Course> findById(Long id);

    Course save(Course course);

    void update(Course course);

    void delete(Long id);

    List<Course> findByDepartment(String department);

    List<Course> findByTeacherId(Long teacherId);
}
