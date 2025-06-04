package com.school.exam.controller;

import com.school.exam.model.QuestionPaper;
import com.school.exam.service.QuestionPaperService;
import com.school.exam.dto.QuestionPaperRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/question-papers")
@Tag(name = "Question Paper Management", description = "APIs for managing question papers")
@SecurityRequirement(name = "bearerAuth")
public class QuestionPaperController {

    @Autowired
    private QuestionPaperService questionPaperService;

    @Operation(summary = "Create question paper", description = "Creates a new question paper with questions")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Question paper created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid question paper data")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD')")
    public ResponseEntity<QuestionPaper> createQuestionPaper(
            @Valid @RequestBody QuestionPaperRequest request) {
        return ResponseEntity.ok(questionPaperService.createQuestionPaper(request));
    }

    @Operation(summary = "Update question paper", description = "Updates an existing question paper")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Question paper updated successfully"),
            @ApiResponse(responseCode = "404", description = "Question paper not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD')")
    public ResponseEntity<QuestionPaper> updateQuestionPaper(
            @PathVariable Long id,
            @Valid @RequestBody QuestionPaperRequest request) {
        return ResponseEntity.ok(questionPaperService.updateQuestionPaper(id, request));
    }

    @Operation(summary = "Get question paper by ID", description = "Retrieves a question paper by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Question paper found"),
            @ApiResponse(responseCode = "404", description = "Question paper not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<QuestionPaper> getQuestionPaper(@PathVariable Long id) {
        return ResponseEntity.ok(questionPaperService.getQuestionPaper(id));
    }

    @Operation(summary = "Get all question papers", description = "Retrieves all question papers")
    @ApiResponse(responseCode = "200", description = "Question papers retrieved successfully")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<QuestionPaper>> getAllQuestionPapers() {
        return ResponseEntity.ok(questionPaperService.getAllQuestionPapers());
    }

    @Operation(summary = "Get question papers by exam", description = "Retrieves all question papers for a specific exam")
    @ApiResponse(responseCode = "200", description = "Question papers retrieved successfully")
    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<QuestionPaper>> getQuestionPapersByExam(
            @PathVariable Long examId) {
        return ResponseEntity.ok(questionPaperService.getQuestionPapersByExam(examId));
    }

    @Operation(summary = "Get question papers by blueprint", description = "Retrieves all question papers for a specific blueprint")
    @ApiResponse(responseCode = "200", description = "Question papers retrieved successfully")
    @GetMapping("/blueprint/{blueprintId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<QuestionPaper>> getQuestionPapersByBlueprint(
            @PathVariable Long blueprintId) {
        return ResponseEntity.ok(questionPaperService.getQuestionPapersByBlueprint(blueprintId));
    }

    @Operation(summary = "Get question papers by creator", description = "Retrieves all question papers created by a specific user")
    @ApiResponse(responseCode = "200", description = "Question papers retrieved successfully")
    @GetMapping("/creator/{creatorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<QuestionPaper>> getQuestionPapersByCreator(
            @PathVariable Long creatorId) {
        return ResponseEntity.ok(questionPaperService.getQuestionPapersByCreator(creatorId));
    }

    @Operation(summary = "Get my question papers", description = "Retrieves all question papers created by the current user")
    @ApiResponse(responseCode = "200", description = "Question papers retrieved successfully")
    @GetMapping("/my-papers")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<QuestionPaper>> getMyQuestionPapers(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return ResponseEntity.ok(questionPaperService.getQuestionPapersByCreator(userId));
    }

    @Operation(summary = "Get pending approval question papers", description = "Retrieves all question papers pending approval")
    @ApiResponse(responseCode = "200", description = "Question papers retrieved successfully")
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<QuestionPaper>> getPendingApprovalQuestionPapers() {
        return ResponseEntity.ok(questionPaperService.getPendingApprovalQuestionPapers());
    }

    @Operation(summary = "Get approved question papers", description = "Retrieves all approved question papers")
    @ApiResponse(responseCode = "200", description = "Question papers retrieved successfully")
    @GetMapping("/approved")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<QuestionPaper>> getApprovedQuestionPapers() {
        return ResponseEntity.ok(questionPaperService.getApprovedQuestionPapers());
    }

    @Operation(summary = "Approve question paper", description = "Approves a question paper")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Question paper approved successfully"),
            @ApiResponse(responseCode = "404", description = "Question paper not found")
    })
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HOD', 'PRINCIPAL')")
    public ResponseEntity<QuestionPaper> approveQuestionPaper(
            @PathVariable Long id,
            @RequestParam(required = false) String comments) {
        return ResponseEntity.ok(questionPaperService.approveQuestionPaper(id, comments));
    }

    @Operation(summary = "Reject question paper", description = "Rejects a question paper")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Question paper rejected successfully"),
            @ApiResponse(responseCode = "404", description = "Question paper not found")
    })
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HOD', 'PRINCIPAL')")
    public ResponseEntity<QuestionPaper> rejectQuestionPaper(
            @PathVariable Long id,
            @RequestParam(required = false) String comments) {
        return ResponseEntity.ok(questionPaperService.rejectQuestionPaper(id, comments));
    }

    @Operation(summary = "Delete question paper", description = "Deletes a question paper")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Question paper deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Question paper not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<Void> deleteQuestionPaper(@PathVariable Long id) {
        questionPaperService.deleteQuestionPaper(id);
        return ResponseEntity.noContent().build();
    }
}
