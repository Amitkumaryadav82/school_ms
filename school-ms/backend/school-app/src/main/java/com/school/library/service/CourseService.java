package com.school.library.service;

import com.school.library.model.Course;
import java.util.List;
import java.util.Optional;

public interface CourseService {
    List<Course> getAllCourses();

    Optional<Course> getCourseById(Long id);

    Course createCourse(Course course);

    Course updateCourse(Long id, Course course);

    void deleteCourse(Long id);

    List<Course> getCoursesByDepartment(String department);

    List<Course> getCoursesByTeacherId(Long teacherId);

    boolean enrollStudent(Long courseId, Long studentId);

    boolean unenrollStudent(Long courseId, Long studentId);
}
