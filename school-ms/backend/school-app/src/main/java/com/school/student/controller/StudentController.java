package com.school.student.controller;

import com.school.student.model.Student;
import com.school.student.model.StudentStatus;
import com.school.student.service.StudentService;
import com.school.student.dto.BulkStudentRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@Tag(name = "Student Management", description = "APIs for managing student information")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Operation(summary = "Create a new student", description = "Registers a new student in the system")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Student created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid student data"),
            @ApiResponse(responseCode = "409", description = "Student ID or email already exists")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> createStudent(@Valid @RequestBody Student student) {
        return ResponseEntity.ok(studentService.createStudent(student));
    }

    @Operation(summary = "Create multiple students", description = "Registers multiple students in the system at once")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Students created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid student data"),
            @ApiResponse(responseCode = "409", description = "Student ID or email already exists")
    })
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Student>> createStudentsBulk(@Valid @RequestBody BulkStudentRequest request) {
        if (request.getStudents().size() != request.getExpectedCount()) {
            throw new IllegalArgumentException("Expected count does not match the number of students provided");
        }
        return ResponseEntity.ok(studentService.createStudentsBulk(request.getStudents()));
    }

    @Operation(summary = "Update student information", description = "Updates an existing student's information")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Student updated successfully"),
            @ApiResponse(responseCode = "404", description = "Student not found"),
            @ApiResponse(responseCode = "409", description = "Student ID or email already exists")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody Student student) {
        return ResponseEntity.ok(studentService.updateStudent(id, student));
    }

    @Operation(summary = "Get student by ID", description = "Retrieves a student by their unique identifier")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Student found"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Student> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudent(id));
    }

    @Operation(summary = "Find student by student ID", description = "Retrieves a student by their student ID (roll number)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Student found"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @GetMapping("/student-id/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Student> findByStudentId(@PathVariable String studentId) {
        return ResponseEntity.ok(studentService.findByStudentId(studentId));
    }

    @Operation(summary = "Get all students", description = "Retrieves a list of all students in the system")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @Operation(summary = "Search students", description = "Search students by first name or last name")
    @ApiResponse(responseCode = "200", description = "Search results retrieved successfully")
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> searchStudents(@RequestParam String query) {
        return ResponseEntity.ok(studentService.searchStudents(query));
    }

    @Operation(summary = "Get students by grade", description = "Retrieves all students in a specific grade")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully")
    @GetMapping("/grade/{grade}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getStudentsByGrade(@PathVariable Integer grade) {
        return ResponseEntity.ok(studentService.getStudentsByGrade(grade));
    }

    @Operation(summary = "Get students by section", description = "Retrieves all students in a specific section")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully")
    @GetMapping("/section/{section}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getStudentsBySection(@PathVariable String section) {
        return ResponseEntity.ok(studentService.getStudentsBySection(section));
    }

    @Operation(summary = "Get students by grade and section", description = "Retrieves all students in a specific grade and section")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully")
    @GetMapping("/grade/{grade}/section/{section}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getStudentsByGradeAndSection(
            @PathVariable Integer grade,
            @PathVariable String section) {
        return ResponseEntity.ok(studentService.getStudentsByGradeAndSection(grade, section));
    }

    @Operation(summary = "Get students by status", description = "Retrieves all students with a specific status")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully")
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getStudentsByStatus(@PathVariable StudentStatus status) {
        return ResponseEntity.ok(studentService.getStudentsByStatus(status));
    }

    @Operation(summary = "Update student status", description = "Updates a student's status (active, inactive, graduated, etc)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> updateStudentStatus(
            @PathVariable Long id,
            @RequestBody StudentStatus status) {
        return ResponseEntity.ok(studentService.updateStudentStatus(id, status));
    }

    @Operation(summary = "Delete student", description = "Removes a student from the system")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Student deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}