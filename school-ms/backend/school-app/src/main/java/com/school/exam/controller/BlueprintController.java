package com.school.exam.controller;

import com.school.exam.model.ExamBlueprint;
import com.school.exam.service.BlueprintService;
import com.school.exam.dto.ExamBlueprintRequest;
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

@RestController
@RequestMapping("/api/blueprints")
@Tag(name = "Exam Blueprint Management", description = "APIs for managing exam blueprints")
@SecurityRequirement(name = "bearerAuth")
public class BlueprintController {

    @Autowired
    private BlueprintService blueprintService;

    @Operation(summary = "Create blueprint", description = "Creates a new exam blueprint with chapter distributions")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Blueprint created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid blueprint data")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD')")
    public ResponseEntity<ExamBlueprint> createBlueprint(
            @Valid @RequestBody ExamBlueprintRequest request) {
        return ResponseEntity.ok(blueprintService.createBlueprint(request));
    }

    @Operation(summary = "Update blueprint", description = "Updates an existing exam blueprint")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Blueprint updated successfully"),
            @ApiResponse(responseCode = "404", description = "Blueprint not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD')")
    public ResponseEntity<ExamBlueprint> updateBlueprint(
            @PathVariable Long id,
            @Valid @RequestBody ExamBlueprintRequest request) {
        return ResponseEntity.ok(blueprintService.updateBlueprint(id, request));
    }

    @Operation(summary = "Get blueprint by ID", description = "Retrieves an exam blueprint by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Blueprint found"),
            @ApiResponse(responseCode = "404", description = "Blueprint not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamBlueprint> getBlueprint(@PathVariable Long id) {
        return ResponseEntity.ok(blueprintService.getBlueprint(id));
    }

    @Operation(summary = "Get all blueprints", description = "Retrieves all exam blueprints")
    @ApiResponse(responseCode = "200", description = "Blueprints retrieved successfully")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<ExamBlueprint>> getAllBlueprints() {
        return ResponseEntity.ok(blueprintService.getAllBlueprints());
    }

    @Operation(summary = "Get blueprints by exam configuration", description = "Retrieves all blueprints for a specific exam configuration")
    @ApiResponse(responseCode = "200", description = "Blueprints retrieved successfully")
    @GetMapping("/exam-config/{examConfigId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<ExamBlueprint>> getBlueprintsByExamConfiguration(
            @PathVariable Long examConfigId) {
        return ResponseEntity.ok(blueprintService.getBlueprintsByExamConfiguration(examConfigId));
    }

    @Operation(summary = "Get approved blueprints", description = "Retrieves all approved exam blueprints")
    @ApiResponse(responseCode = "200", description = "Blueprints retrieved successfully")
    @GetMapping("/approved")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<ExamBlueprint>> getApprovedBlueprints() {
        return ResponseEntity.ok(blueprintService.getApprovedBlueprints());
    }

    @Operation(summary = "Approve blueprint", description = "Approves an exam blueprint")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Blueprint approved successfully"),
            @ApiResponse(responseCode = "404", description = "Blueprint not found")
    })
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamBlueprint> approveBlueprint(@PathVariable Long id) {
        return ResponseEntity.ok(blueprintService.approveBlueprint(id));
    }

    @Operation(summary = "Delete blueprint", description = "Deletes an exam blueprint")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Blueprint deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Blueprint not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<Void> deleteBlueprint(@PathVariable Long id) {
        blueprintService.deleteBlueprint(id);
        return ResponseEntity.noContent().build();
    }
}

