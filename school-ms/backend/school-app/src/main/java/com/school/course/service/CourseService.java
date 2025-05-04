package com.school.course.service;

import com.school.course.model.Course;
import java.util.List;

public interface CourseService {
    List<Course> getAllCourses();

    Course getCourseById(Long id);

    Course createCourse(Course course);

    Course updateCourse(Long id, Course course);

    void deleteCourse(Long id);

    List<Course> getCoursesByDepartment(String department);

    List<Course> getCoursesByTeacherId(Long teacherId);

    void enrollStudent(Long courseId, Long studentId);

    void unenrollStudent(Long courseId, Long studentId);
}