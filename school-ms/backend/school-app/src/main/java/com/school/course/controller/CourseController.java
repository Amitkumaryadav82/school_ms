package com.school.course.controller;

import com.school.course.model.Course;
import com.school.course.service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("schoolCourseController")
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        try {
            Course course = courseService.getCourseById(id);
            return ResponseEntity.ok(course);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        Course createdCourse = courseService.createCourse(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        try {
            Course updatedCourse = courseService.updateCourse(id, course);
            return ResponseEntity.ok(updatedCourse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<Course>> getCoursesByDepartment(@PathVariable String department) {
        List<Course> courses = courseService.getCoursesByDepartment(department);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Course>> getCoursesByTeacherId(@PathVariable Long teacherId) {
        List<Course> courses = courseService.getCoursesByTeacherId(teacherId);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<?> enrollStudent(@PathVariable Long courseId, @RequestBody Map<String, Long> request) {
        Long studentId = request.get("studentId");
        if (studentId == null) {
            return ResponseEntity.badRequest().body("Student ID is required");
        }

        try {
            courseService.enrollStudent(courseId, studentId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{courseId}/enroll")
    public ResponseEntity<?> unenrollStudent(@PathVariable Long courseId, @RequestParam Long studentId) {
        try {
            courseService.unenrollStudent(courseId, studentId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}