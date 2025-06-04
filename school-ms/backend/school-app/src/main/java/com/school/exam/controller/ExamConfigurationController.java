package com.school.exam.controller;

import com.school.exam.model.ExamConfiguration;
import com.school.exam.model.QuestionPaperStructure;
import com.school.exam.service.ExamConfigurationService;
import com.school.exam.dto.ExamConfigurationRequest;
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
@RequestMapping("/api/exam-configurations")
@Tag(name = "Exam Configuration Management", description = "APIs for managing exam configurations")
@SecurityRequirement(name = "bearerAuth")
public class ExamConfigurationController {

    @Autowired
    private ExamConfigurationService examConfigurationService;

    @Operation(summary = "Create exam configuration", description = "Creates a new exam configuration with paper structure")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Configuration created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid configuration data")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamConfiguration> createExamConfiguration(
            @Valid @RequestBody ExamConfigurationRequest request) {
        return ResponseEntity.ok(examConfigurationService.createExamConfiguration(request));
    }

    @Operation(summary = "Update exam configuration", description = "Updates an existing exam configuration")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Configuration updated successfully"),
            @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamConfiguration> updateExamConfiguration(
            @PathVariable Long id,
            @Valid @RequestBody ExamConfigurationRequest request) {
        return ResponseEntity.ok(examConfigurationService.updateExamConfiguration(id, request));
    }

    @Operation(summary = "Get exam configuration by ID", description = "Retrieves an exam configuration by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Configuration found"),
            @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamConfiguration> getExamConfiguration(@PathVariable Long id) {
        return ResponseEntity.ok(examConfigurationService.getExamConfiguration(id));
    }

    @Operation(summary = "Get all exam configurations", description = "Retrieves all exam configurations")
    @ApiResponse(responseCode = "200", description = "Configurations retrieved successfully")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<ExamConfiguration>> getAllExamConfigurations() {
        return ResponseEntity.ok(examConfigurationService.getAllExamConfigurations());
    }

    @Operation(summary = "Get exam configurations by grade", description = "Retrieves all exam configurations for a specific grade")
    @ApiResponse(responseCode = "200", description = "Configurations retrieved successfully")
    @GetMapping("/grade/{grade}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<ExamConfiguration>> getExamConfigurationsByGrade(
            @PathVariable Integer grade) {
        return ResponseEntity.ok(examConfigurationService.getExamConfigurationsByGrade(grade));
    }

    @Operation(summary = "Get exam configurations by subject", description = "Retrieves all exam configurations for a specific subject")
    @ApiResponse(responseCode = "200", description = "Configurations retrieved successfully")
    @GetMapping("/subject/{subject}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<ExamConfiguration>> getExamConfigurationsBySubject(
            @PathVariable String subject) {
        return ResponseEntity.ok(examConfigurationService.getExamConfigurationsBySubject(subject));
    }

    @Operation(summary = "Get active exam configurations", description = "Retrieves all active exam configurations")
    @ApiResponse(responseCode = "200", description = "Configurations retrieved successfully")
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<ExamConfiguration>> getActiveExamConfigurations() {
        return ResponseEntity.ok(examConfigurationService.getActiveExamConfigurations());
    }

    @Operation(summary = "Get exam configurations by academic year", description = "Retrieves all exam configurations for a specific academic year")
    @ApiResponse(responseCode = "200", description = "Configurations retrieved successfully")
    @GetMapping("/academic-year/{year}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<ExamConfiguration>> getExamConfigurationsByAcademicYear(
            @PathVariable Integer year) {
        return ResponseEntity.ok(examConfigurationService.getExamConfigurationsByAcademicYear(year));
    }

    @Operation(summary = "Approve exam configuration", description = "Approves an exam configuration")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Configuration approved successfully"),
            @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamConfiguration> approveExamConfiguration(@PathVariable Long id) {
        return ResponseEntity.ok(examConfigurationService.approveExamConfiguration(id));
    }

    @Operation(summary = "Reject exam configuration", description = "Rejects an exam configuration")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Configuration rejected successfully"),
            @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamConfiguration> rejectExamConfiguration(@PathVariable Long id) {
        return ResponseEntity.ok(examConfigurationService.rejectExamConfiguration(id));
    }

    @Operation(summary = "Delete exam configuration", description = "Deletes an exam configuration")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Configuration deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<Void> deleteExamConfiguration(@PathVariable Long id) {
        examConfigurationService.deleteExamConfiguration(id);
        return ResponseEntity.noContent().build();
    }
}
