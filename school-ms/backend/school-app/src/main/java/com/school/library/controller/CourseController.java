package com.school.library.controller;

import com.school.library.model.Course;
import com.school.library.service.CourseService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Course controller for library-specific course operations.
 * The endpoint was changed from /api/courses to /api/library/courses to avoid conflicts
 * with ConsolidatedCourseController. This controller specifically handles library-related
 * course operations while the main course operations are handled by ConsolidatedCourseController.
 */

@RestController
@RequestMapping("/api/library/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(@Qualifier("libraryCourseService") CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        try {
            return courseService.getCourseById(id)
                    .map(ResponseEntity::ok)
                    .orElseThrow(
                            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with ID: " + id));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving course", e);
        }
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        try {
            Course createdCourse = courseService.createCourse(course);
            return new ResponseEntity<>(createdCourse, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid course data", e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        try {
            Course updatedCourse = courseService.updateCourse(id, course);
            return ResponseEntity.ok(updatedCourse);
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating course", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting course", e);
        }
    }

    @GetMapping("/department/{department}")
    public List<Course> getCoursesByDepartment(@PathVariable String department) {
        try {
            return courseService.getCoursesByDepartment(department);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving courses for department: " + department, e);
        }
    }

    @GetMapping("/teacher/{teacherId}")
    public List<Course> getCoursesByTeacher(@PathVariable Long teacherId) {
        try {
            return courseService.getCoursesByTeacherId(teacherId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving courses for teacher ID: " + teacherId, e);
        }
    }

    @PostMapping("/{courseId}/enroll/{studentId}")
    public ResponseEntity<Map<String, Object>> enrollStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        try {
            boolean success = courseService.enrollStudent(courseId, studentId);
            Map<String, Object> response = new HashMap<>();

            if (success) {
                response.put("success", true);
                response.put("message", "Student successfully enrolled in course");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message",
                        "Student could not be enrolled. Course may be full or student already enrolled.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error enrolling student in course", e);
        }
    }

    @DeleteMapping("/{courseId}/enroll/{studentId}")
    public ResponseEntity<Map<String, Object>> unenrollStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        try {
            boolean success = courseService.unenrollStudent(courseId, studentId);
            Map<String, Object> response = new HashMap<>();

            if (success) {
                response.put("success", true);
                response.put("message", "Student successfully unenrolled from course");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Student could not be unenrolled. Student may not be enrolled in this course.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error unenrolling student from course", e);
        }
    }
}
