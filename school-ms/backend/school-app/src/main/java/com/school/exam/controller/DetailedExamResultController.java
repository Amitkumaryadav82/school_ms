package com.school.exam.controller;

import com.school.exam.model.DetailedExamResult;
import com.school.exam.service.DetailedExamResultService;
import com.school.exam.dto.DetailedExamResultRequest;
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
@RequestMapping("/api/detailed-results")
@Tag(name = "Detailed Exam Results Management", description = "APIs for managing detailed exam results")
@SecurityRequirement(name = "bearerAuth")
public class DetailedExamResultController {

    @Autowired
    private DetailedExamResultService detailedExamResultService;

    @Operation(summary = "Record detailed result", description = "Records a detailed exam result for a question")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Result recorded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid result data")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD')")
    public ResponseEntity<DetailedExamResult> recordDetailedResult(
            @Valid @RequestBody DetailedExamResultRequest request) {
        return ResponseEntity.ok(detailedExamResultService.recordDetailedResult(request));
    }

    @Operation(summary = "Update detailed result", description = "Updates an existing detailed exam result")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Result updated successfully"),
            @ApiResponse(responseCode = "404", description = "Result not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD')")
    public ResponseEntity<DetailedExamResult> updateDetailedResult(
            @PathVariable Long id,
            @Valid @RequestBody DetailedExamResultRequest request) {
        return ResponseEntity.ok(detailedExamResultService.updateDetailedResult(id, request));
    }

    @Operation(summary = "Get detailed result by ID", description = "Retrieves a detailed exam result by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Result found"),
            @ApiResponse(responseCode = "404", description = "Result not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<DetailedExamResult> getDetailedResult(@PathVariable Long id) {
        return ResponseEntity.ok(detailedExamResultService.getDetailedResult(id));
    }

    @Operation(summary = "Get detailed results by exam result", description = "Retrieves all detailed results for an exam result")
    @ApiResponse(responseCode = "200", description = "Results retrieved successfully")
    @GetMapping("/exam-result/{examResultId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<DetailedExamResult>> getDetailedResultsByExamResult(
            @PathVariable Long examResultId) {
        return ResponseEntity.ok(detailedExamResultService.getDetailedResultsByExamResult(examResultId));
    }

    @Operation(summary = "Get detailed results by exam", description = "Retrieves all detailed results for an exam")
    @ApiResponse(responseCode = "200", description = "Results retrieved successfully")
    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<DetailedExamResult>> getDetailedResultsByExam(
            @PathVariable Long examId) {
        return ResponseEntity.ok(detailedExamResultService.getDetailedResultsByExam(examId));
    }

    @Operation(summary = "Get detailed results by question", description = "Retrieves all detailed results for a question")
    @ApiResponse(responseCode = "200", description = "Results retrieved successfully")
    @GetMapping("/question/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<DetailedExamResult>> getDetailedResultsByQuestion(
            @PathVariable Long questionId) {
        return ResponseEntity.ok(detailedExamResultService.getDetailedResultsByQuestion(questionId));
    }

    @Operation(summary = "Get detailed results by chapter", description = "Retrieves all detailed results for a chapter")
    @ApiResponse(responseCode = "200", description = "Results retrieved successfully")
    @GetMapping("/chapter/{chapterId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<DetailedExamResult>> getDetailedResultsByChapter(
            @PathVariable Long chapterId) {
        return ResponseEntity.ok(detailedExamResultService.getDetailedResultsByChapter(chapterId));
    }

    @Operation(summary = "Lock result", description = "Locks a detailed exam result")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Result locked successfully"),
            @ApiResponse(responseCode = "404", description = "Result not found")
    })
    @PutMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<DetailedExamResult> lockResult(@PathVariable Long id) {
        return ResponseEntity.ok(detailedExamResultService.lockResult(id));
    }

    @Operation(summary = "Unlock result", description = "Unlocks a detailed exam result")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Result unlocked successfully"),
            @ApiResponse(responseCode = "404", description = "Result not found")
    })
    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<DetailedExamResult> unlockResult(@PathVariable Long id) {
        return ResponseEntity.ok(detailedExamResultService.unlockResult(id));
    }

    @Operation(summary = "Review result", description = "Marks a detailed exam result as reviewed")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Result reviewed successfully"),
            @ApiResponse(responseCode = "404", description = "Result not found")
    })
    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<DetailedExamResult> reviewResult(@PathVariable Long id) {
        return ResponseEntity.ok(detailedExamResultService.reviewResult(id));
    }

    @Operation(summary = "Lock all results for exam", description = "Locks all detailed exam results for an exam")
    @ApiResponse(responseCode = "200", description = "Results locked successfully")
    @PutMapping("/exam/{examId}/lock-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<Void> lockAllResultsForExam(@PathVariable Long examId) {
        detailedExamResultService.lockAllResultsForExam(examId);
        return ResponseEntity.ok().build();
    }
}
