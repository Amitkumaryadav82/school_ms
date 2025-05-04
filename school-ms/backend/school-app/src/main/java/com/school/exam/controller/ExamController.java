package com.school.exam.controller;

import com.school.exam.model.Exam;
import com.school.exam.model.ExamResult;
import com.school.exam.service.ExamService;
import com.school.exam.dto.ExamRequest;
import com.school.exam.dto.ExamResultRequest;
import com.school.exam.dto.ExamSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@Tag(name = "Examination Management", description = "APIs for managing exams and results")
@SecurityRequirement(name = "bearerAuth")
public class ExamController {

    @Autowired
    private ExamService examService;

    @Operation(summary = "Create exam", description = "Creates a new exam")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Exam created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid exam data")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Exam> createExam(@Valid @RequestBody ExamRequest request) {
        return ResponseEntity.ok(examService.createExam(request));
    }

    @Operation(summary = "Update exam", description = "Updates an existing exam")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Exam updated successfully"),
            @ApiResponse(responseCode = "404", description = "Exam not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Exam> updateExam(@PathVariable Long id, @Valid @RequestBody ExamRequest request) {
        return ResponseEntity.ok(examService.updateExam(id, request));
    }

    @Operation(summary = "Get exam by ID", description = "Retrieves an exam by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Exam found"),
            @ApiResponse(responseCode = "404", description = "Exam not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Exam> getExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExam(id));
    }

    @Operation(summary = "Get exams by grade", description = "Retrieves all exams for a specific grade")
    @ApiResponse(responseCode = "200", description = "Exams retrieved successfully")
    @GetMapping("/grade/{grade}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Exam>> getExamsByGrade(@PathVariable Integer grade) {
        return ResponseEntity.ok(examService.getExamsByGrade(grade));
    }

    @Operation(summary = "Get exams by subject", description = "Retrieves all exams for a specific subject")
    @ApiResponse(responseCode = "200", description = "Exams retrieved successfully")
    @GetMapping("/subject/{subject}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Exam>> getExamsBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(examService.getExamsBySubject(subject));
    }

    @Operation(summary = "Get exams by date range", description = "Retrieves exams scheduled within a date range")
    @ApiResponse(responseCode = "200", description = "Exams retrieved successfully")
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Exam>> getExamsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(examService.getExamsByDateRange(startDate, endDate));
    }

    @Operation(summary = "Record exam result", description = "Records a student's exam result")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Result recorded successfully"),
            @ApiResponse(responseCode = "404", description = "Exam or student not found")
    })
    @PostMapping("/results")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ExamResult> recordResult(@Valid @RequestBody ExamResultRequest request) {
        return ResponseEntity.ok(examService.recordResult(request));
    }

    @Operation(summary = "Update exam result", description = "Updates a student's exam result")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Result updated successfully"),
            @ApiResponse(responseCode = "404", description = "Result not found")
    })
    @PutMapping("/results/{examId}/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ExamResult> updateResult(
            @PathVariable Long examId,
            @PathVariable Long studentId,
            @Valid @RequestBody ExamResultRequest request) {
        return ResponseEntity.ok(examService.updateResult(examId, studentId, request));
    }

    @Operation(summary = "Get student results", description = "Retrieves all exam results for a student")
    @ApiResponse(responseCode = "200", description = "Results retrieved successfully")
    @GetMapping("/results/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")
    public ResponseEntity<List<ExamResult>> getStudentResults(@PathVariable Long studentId) {
        return ResponseEntity.ok(examService.getStudentResults(studentId));
    }

    @Operation(summary = "Get exam summary", description = "Generates a summary report for an exam")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Summary generated successfully"),
            @ApiResponse(responseCode = "404", description = "Exam not found")
    })
    @GetMapping("/{id}/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ExamSummary> getExamSummary(@PathVariable Long id) {
        return ResponseEntity.ok(examService.generateExamSummary(id));
    }
}