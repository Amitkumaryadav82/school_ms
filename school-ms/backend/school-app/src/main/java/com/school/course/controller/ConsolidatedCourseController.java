package com.school.course.controller;

import com.school.course.model.ConsolidatedCourse;
import com.school.course.service.ConsolidatedCourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.HashMap;

/**
 * Consolidated Course controller that combines functionality from both previous
 * implementations.
 * This combines features from:
 * - com.schoolms.controller.CourseController
 * - com.school.course.controller.CourseController
 */
@RestController
@RequestMapping("/api/courses")
@Tag(name = "Course Management", description = "APIs for managing course information")
public class ConsolidatedCourseController {

    private final ConsolidatedCourseService courseService;

    @Autowired
    public ConsolidatedCourseController(ConsolidatedCourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    @Operation(summary = "Get all courses", description = "Returns a list of all courses in the system")
    public ResponseEntity<List<ConsolidatedCourse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID", description = "Returns a single course by its ID")
    public ResponseEntity<ConsolidatedCourse> getCourseById(@PathVariable Long id) {
        try {
            ConsolidatedCourse course = courseService.getCourseById(id);
            return ResponseEntity.ok(course);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Create new course", description = "Creates a new course in the system")
    public ResponseEntity<ConsolidatedCourse> createCourse(@Valid @RequestBody ConsolidatedCourse course) {
        ConsolidatedCourse createdCourse = courseService.createCourse(course);
        return new ResponseEntity<>(createdCourse, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Update course", description = "Updates an existing course by its ID")
    public ResponseEntity<ConsolidatedCourse> updateCourse(@PathVariable Long id,
            @Valid @RequestBody ConsolidatedCourse course) {
        try {
            ConsolidatedCourse updatedCourse = courseService.updateCourse(id, course);
            return ResponseEntity.ok(updatedCourse);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete course", description = "Deletes a course from the system")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/department/{department}")
    @Operation(summary = "Get courses by department", description = "Returns all courses in a specific department")
    public ResponseEntity<List<ConsolidatedCourse>> getCoursesByDepartment(@PathVariable String department) {
        List<ConsolidatedCourse> courses = courseService.getCoursesByDepartment(department);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/teacher/{teacherId}")
    @Operation(summary = "Get courses by teacher", description = "Returns all courses taught by a specific teacher")
    public ResponseEntity<List<ConsolidatedCourse>> getCoursesByTeacherId(@PathVariable Long teacherId) {
        List<ConsolidatedCourse> courses = courseService.getCoursesByTeacherId(teacherId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get course statistics", description = "Returns statistics about courses in the system")
    public ResponseEntity<Map<String, Object>> getCourseStats() {
        List<ConsolidatedCourse> allCourses = courseService.getAllCourses();

        int totalCourses = allCourses.size();
        long activeCourses = allCourses.stream().filter(c -> Boolean.TRUE.equals(c.getIsActive())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCourses", totalCourses);
        stats.put("activeCourses", activeCourses);

        return ResponseEntity.ok(stats);
    }
}
