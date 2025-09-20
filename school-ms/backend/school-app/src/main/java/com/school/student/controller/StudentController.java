package com.school.student.controller;

import com.school.student.model.Student;
import com.school.student.model.StudentStatus;
import com.school.student.service.StudentService;
import com.school.student.dto.BulkStudentRequest;
import com.school.student.dto.StudentDTO;
import com.school.student.util.StudentMapper;
import com.school.student.dto.StudentDeletionImpactDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
@RequestMapping("/api/students")
@Tag(name = "Student Management", description = "APIs for managing student information")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentMapper studentMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Operation(summary = "Get current student profile", description = "Returns the student profile for the authenticated STUDENT user")
    @ApiResponse(responseCode = "200", description = "Student profile retrieved successfully")
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentDTO> getCurrentStudentProfile() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        Long studentId = jdbcTemplate.query(
                "select s.id from students s join users u on lower(s.email) = lower(u.email) where u.id = ?",
                rs -> rs.next() ? rs.getLong(1) : null,
                userId);
        if (studentId == null) {
            return ResponseEntity.notFound().build();
        }
        Student student = studentService.getStudent(studentId);
        return ResponseEntity.ok(studentMapper.toDTO(student));
    }

    private Long getCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth == null)
            return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof com.school.security.User) {
            return ((com.school.security.User) principal).getId();
        }
        return null;
    }

    @Operation(summary = "Create a new student", description = "Registers a new student in the system")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Student created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid student data"),
            @ApiResponse(responseCode = "409", description = "Student ID or email already exists")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody StudentDTO studentDTO) {
        Student student = studentMapper.toEntity(studentDTO);
        Student createdStudent = studentService.createStudent(student);
        return ResponseEntity.ok(studentMapper.toDTO(createdStudent));
    }

    @Operation(summary = "Create multiple students", description = "Registers multiple students in the system at once")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Students created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid student data"),
            @ApiResponse(responseCode = "409", description = "Student ID or email already exists")
    })
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StudentDTO>> createStudentsBulk(@Valid @RequestBody BulkStudentRequest request) {
        if (request.getStudents().size() != request.getExpectedCount()) {
            throw new IllegalArgumentException("Expected count does not match the number of students provided");
        }
        List<Student> createdStudents = studentService.createStudentsBulk(request.getStudents());
        return ResponseEntity.ok(studentMapper.toDTOList(createdStudents));
    }

    @Operation(summary = "Update student information", description = "Updates an existing student's information")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Student updated successfully"),
            @ApiResponse(responseCode = "404", description = "Student not found"),
            @ApiResponse(responseCode = "409", description = "Student ID or email already exists")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDTO> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentDTO studentDTO) {
        Student student = studentMapper.toEntity(studentDTO);
        Student updatedStudent = studentService.updateStudent(id, student);
        return ResponseEntity.ok(studentMapper.toDTO(updatedStudent));
    }

    @Operation(summary = "Get student by ID", description = "Retrieves a student by their unique identifier")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Student found"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<StudentDTO> getStudent(@PathVariable Long id) {
        Student student = studentService.getStudent(id);
        return ResponseEntity.ok(studentMapper.toDTO(student));
    }

    @Operation(summary = "Find student by student ID", description = "Retrieves a student by their student ID (roll number)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Student found"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @GetMapping("/student-id/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<StudentDTO> findByStudentId(@PathVariable String studentId) {
        Student student = studentService.findByStudentId(studentId);
        return ResponseEntity.ok(studentMapper.toDTO(student));
    }

    @Operation(summary = "Get all students", description = "Retrieves a list of all students in the system")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        return ResponseEntity.ok(studentMapper.toDTOList(students));
    }

    @Operation(summary = "Search students", description = "Search students by first name or last name")
    @ApiResponse(responseCode = "200", description = "Search results retrieved successfully")
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<StudentDTO>> searchStudents(@RequestParam String query) {
        List<Student> students = studentService.searchStudents(query);
        return ResponseEntity.ok(studentMapper.toDTOList(students));
    }

    @Operation(summary = "Get students by grade", description = "Retrieves all students in a specific grade")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully")
    @GetMapping("/grade/{grade}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<StudentDTO>> getStudentsByGrade(@PathVariable Integer grade) {
        List<Student> students = studentService.getStudentsByGrade(grade);
        return ResponseEntity.ok(studentMapper.toDTOList(students));
    }

    @Operation(summary = "Get students by section", description = "Retrieves all students in a specific section")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully")
    @GetMapping("/section/{section}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<StudentDTO>> getStudentsBySection(@PathVariable String section) {
        List<Student> students = studentService.getStudentsBySection(section);
        return ResponseEntity.ok(studentMapper.toDTOList(students));
    }

    @Operation(summary = "Get students by grade and section", description = "Retrieves all students in a specific grade and section")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully")
    @GetMapping("/grade/{grade}/section/{section}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<StudentDTO>> getStudentsByGradeAndSection(
            @PathVariable Integer grade,
            @PathVariable String section) {
        List<Student> students = studentService.getStudentsByGradeAndSection(grade, section);
        return ResponseEntity.ok(studentMapper.toDTOList(students));
    }

    @Operation(summary = "Get students by status", description = "Retrieves all students with a specific status")
    @ApiResponse(responseCode = "200", description = "List of students retrieved successfully")
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<StudentDTO>> getStudentsByStatus(@PathVariable StudentStatus status) {
        List<Student> students = studentService.getStudentsByStatus(status);
        return ResponseEntity.ok(studentMapper.toDTOList(students));
    }

    @Operation(summary = "Update student status", description = "Updates a student's status (active, inactive, graduated, etc)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDTO> updateStudentStatus(
            @PathVariable Long id,
            @RequestBody StudentStatus status) {
        Student student = studentService.updateStudentStatus(id, status);
        return ResponseEntity.ok(studentMapper.toDTO(student));
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

    @Operation(summary = "Get deletion impact for a student", description = "Returns counts of linked records that would be affected or block deletion.")
    @ApiResponse(responseCode = "200", description = "Impact calculated successfully")
    @GetMapping("/{id}/deletion-impact")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDeletionImpactDTO> getDeletionImpact(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getDeletionImpact(id));
    }
}
