package com.school.exam.controller.configuration;

import com.school.exam.dto.configuration.SubjectMasterDTO;
import com.school.exam.dto.configuration.SubjectMasterRequest;
import com.school.exam.model.configuration.SubjectType;
import com.school.exam.service.configuration.SubjectMasterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing Subject Master operations.
 * Provides endpoints for CRUD operations on subject masters.
 */
@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Subject Master Management", description = "APIs for managing subject masters")
public class SubjectMasterController {

    private final SubjectMasterService subjectMasterService;

    @Operation(summary = "Create a new subject master")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Subject master created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or validation error"),
            @ApiResponse(responseCode = "409", description = "Subject code or name already exists")
    })
    @PostMapping
    public ResponseEntity<SubjectMasterDTO> createSubject(@Valid @RequestBody SubjectMasterRequest request) {
        log.info("Creating new subject with code: {}", request.getSubjectCode());
        
        try {
            SubjectMasterDTO createdSubject = subjectMasterService.createSubject(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSubject);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to create subject: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Update an existing subject master")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subject master updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or validation error"),
            @ApiResponse(responseCode = "404", description = "Subject master not found"),
            @ApiResponse(responseCode = "409", description = "Subject code or name already exists")
    })
    @PutMapping("/{id}")
    public ResponseEntity<SubjectMasterDTO> updateSubject(
            @Parameter(description = "Subject master ID", required = true) @PathVariable Long id,
            @Valid @RequestBody SubjectMasterRequest request) {
        log.info("Updating subject with ID: {}", id);
        
        try {
            SubjectMasterDTO updatedSubject = subjectMasterService.updateSubject(id, request);
            return ResponseEntity.ok(updatedSubject);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to update subject: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Get subject master by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subject master retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Subject master not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<SubjectMasterDTO> getSubjectById(
            @Parameter(description = "Subject master ID", required = true) @PathVariable Long id) {
        log.debug("Fetching subject by ID: {}", id);
        
        try {
            SubjectMasterDTO subject = subjectMasterService.getSubjectById(id);
            return ResponseEntity.ok(subject);
        } catch (IllegalArgumentException e) {
            log.warn("Subject not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get subject master by code")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subject master retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Subject master not found")
    })
    @GetMapping("/by-code/{code}")
    public ResponseEntity<SubjectMasterDTO> getSubjectByCode(
            @Parameter(description = "Subject code", required = true) @PathVariable @NotBlank String code) {
        log.debug("Fetching subject by code: {}", code);
        
        try {
            SubjectMasterDTO subject = subjectMasterService.getSubjectByCode(code);
            return ResponseEntity.ok(subject);
        } catch (IllegalArgumentException e) {
            log.warn("Subject not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get all active subjects")
    @ApiResponse(responseCode = "200", description = "Active subjects retrieved successfully")
    @GetMapping("/active")
    public ResponseEntity<List<SubjectMasterDTO>> getAllActiveSubjects() {
        log.debug("Fetching all active subjects");
        
        List<SubjectMasterDTO> subjects = subjectMasterService.getAllActiveSubjects();
        return ResponseEntity.ok(subjects);
    }

    @Operation(summary = "Get all active subjects with pagination")
    @ApiResponse(responseCode = "200", description = "Active subjects retrieved successfully with pagination")
    @GetMapping
    public ResponseEntity<Page<SubjectMasterDTO>> getAllActiveSubjects(
            @PageableDefault(size = 20) Pageable pageable) {
        log.debug("Fetching active subjects with pagination: {}", pageable);
        
        Page<SubjectMasterDTO> subjects = subjectMasterService.getAllActiveSubjects(pageable);
        return ResponseEntity.ok(subjects);
    }

    @Operation(summary = "Get subjects by type")
    @ApiResponse(responseCode = "200", description = "Subjects retrieved successfully by type")
    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<SubjectMasterDTO>> getSubjectsByType(
            @Parameter(description = "Subject type", required = true) @PathVariable @NotNull SubjectType type) {
        log.debug("Fetching subjects by type: {}", type);
        
        List<SubjectMasterDTO> subjects = subjectMasterService.getSubjectsByType(type);
        return ResponseEntity.ok(subjects);
    }

    @Operation(summary = "Search subjects by name or code")
    @ApiResponse(responseCode = "200", description = "Search results retrieved successfully")
    @GetMapping("/search")
    public ResponseEntity<Page<SubjectMasterDTO>> searchSubjects(
            @Parameter(description = "Search term") @RequestParam(required = false) String searchTerm,
            @Parameter(description = "Filter by active status") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Filter by subject type") @RequestParam(required = false) SubjectType subjectType,
            @PageableDefault(size = 20) Pageable pageable) {
        log.debug("Searching subjects with term: {}, active: {}, type: {}", searchTerm, isActive, subjectType);
        
        Page<SubjectMasterDTO> subjects = subjectMasterService.searchSubjects(searchTerm, isActive, subjectType, pageable);
        return ResponseEntity.ok(subjects);
    }

    @Operation(summary = "Delete a subject master (soft delete)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Subject master deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Subject master not found"),
            @ApiResponse(responseCode = "409", description = "Subject master is currently in use")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(
            @Parameter(description = "Subject master ID", required = true) @PathVariable Long id) {
        log.info("Deleting subject with ID: {}", id);
        
        try {
            subjectMasterService.deleteSubject(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Subject not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            log.warn("Cannot delete subject: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @Operation(summary = "Update subject master status (activate/deactivate)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subject master status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Subject master not found"),
            @ApiResponse(responseCode = "409", description = "Cannot deactivate subject that is in use")
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<SubjectMasterDTO> updateSubjectStatus(
            @Parameter(description = "Subject master ID", required = true) @PathVariable Long id,
            @RequestBody Map<String, Boolean> statusUpdate) {
        log.info("Updating subject status for ID: {}", id);
        
        Boolean isActive = statusUpdate.get("isActive");
        if (isActive == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            SubjectMasterDTO updatedSubject = subjectMasterService.updateSubjectStatus(id, isActive);
            return ResponseEntity.ok(updatedSubject);
        } catch (IllegalArgumentException e) {
            log.warn("Subject not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            log.warn("Cannot update subject status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @Operation(summary = "Check if subject code exists")
    @ApiResponse(responseCode = "200", description = "Check result returned")
    @GetMapping("/exists/code/{code}")
    public ResponseEntity<Map<String, Boolean>> existsByCode(
            @Parameter(description = "Subject code", required = true) @PathVariable @NotBlank String code) {
        log.debug("Checking if subject code exists: {}", code);
        
        boolean exists = subjectMasterService.existsByCode(code);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @Operation(summary = "Check if subject name exists")
    @ApiResponse(responseCode = "200", description = "Check result returned")
    @GetMapping("/exists/name/{name}")
    public ResponseEntity<Map<String, Boolean>> existsByName(
            @Parameter(description = "Subject name", required = true) @PathVariable @NotBlank String name) {
        log.debug("Checking if subject name exists: {}", name);
        
        boolean exists = subjectMasterService.existsByName(name);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @Operation(summary = "Get subjects that are currently in use")
    @ApiResponse(responseCode = "200", description = "Subjects in use retrieved successfully")
    @GetMapping("/in-use")
    public ResponseEntity<List<SubjectMasterDTO>> getSubjectsInUse() {
        log.debug("Fetching subjects that are in use");
        
        List<SubjectMasterDTO> subjects = subjectMasterService.getSubjectsInUse();
        return ResponseEntity.ok(subjects);
    }

    @Operation(summary = "Get subjects that are not currently in use")
    @ApiResponse(responseCode = "200", description = "Unused subjects retrieved successfully")
    @GetMapping("/not-in-use")
    public ResponseEntity<List<SubjectMasterDTO>> getSubjectsNotInUse() {
        log.debug("Fetching subjects that are not in use");
        
        List<SubjectMasterDTO> subjects = subjectMasterService.getSubjectsNotInUse();
        return ResponseEntity.ok(subjects);
    }

    @Operation(summary = "Get subjects with their configuration count")
    @ApiResponse(responseCode = "200", description = "Subjects with configuration count retrieved successfully")
    @GetMapping("/with-config-count")
    public ResponseEntity<List<SubjectMasterDTO>> getSubjectsWithConfigurationCount() {
        log.debug("Fetching subjects with configuration count");
        
        List<SubjectMasterDTO> subjects = subjectMasterService.getSubjectsWithConfigurationCount();
        return ResponseEntity.ok(subjects);
    }
}
