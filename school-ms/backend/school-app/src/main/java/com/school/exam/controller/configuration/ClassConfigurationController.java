package com.school.exam.controller.configuration;

import com.school.exam.dto.configuration.*;
import com.school.exam.service.configuration.ClassConfigurationService;
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
import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing Class Configuration operations.
 */
@RestController
@RequestMapping("/api/class-configurations")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Class Configuration Management", description = "APIs for managing class configurations")
public class ClassConfigurationController {

    private final ClassConfigurationService classConfigurationService;

    @Operation(summary = "Create a new class configuration")
    @PostMapping
    public ResponseEntity<ClassConfigurationDTO> createConfiguration(@Valid @RequestBody ClassConfigurationRequest request) {
        try {
            ClassConfigurationDTO created = classConfigurationService.createConfiguration(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Update an existing class configuration")
    @PutMapping("/{id}")
    public ResponseEntity<ClassConfigurationDTO> updateConfiguration(
            @PathVariable Long id, @Valid @RequestBody ClassConfigurationRequest request) {
        try {
            ClassConfigurationDTO updated = classConfigurationService.updateConfiguration(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Get class configuration by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ClassConfigurationDTO> getConfigurationById(@PathVariable Long id) {
        try {
            ClassConfigurationDTO configuration = classConfigurationService.getConfigurationById(id);
            return ResponseEntity.ok(configuration);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get all active configurations")
    @GetMapping
    public ResponseEntity<Page<ClassConfigurationDTO>> getAllActiveConfigurations(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ClassConfigurationDTO> configurations = classConfigurationService.getAllActiveConfigurations(pageable);
        return ResponseEntity.ok(configurations);
    }

    @Operation(summary = "Copy configuration from one class to another")
    @PostMapping("/copy")
    public ResponseEntity<CopyConfigurationResponse> copyConfiguration(@Valid @RequestBody CopyConfigurationRequest request) {
        try {
            CopyConfigurationResponse response = classConfigurationService.copyConfiguration(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Search configurations")
    @GetMapping("/search")
    public ResponseEntity<Page<ClassConfigurationDTO>> searchConfigurations(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String academicYear,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ClassConfigurationDTO> configurations = classConfigurationService
                .searchConfigurations(searchTerm, isActive, academicYear, pageable);
        return ResponseEntity.ok(configurations);
    }

    @Operation(summary = "Delete a class configuration")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable Long id) {
        try {
            classConfigurationService.deleteConfiguration(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get distinct academic years")
    @GetMapping("/academic-years")
    public ResponseEntity<List<String>> getDistinctAcademicYears() {
        List<String> years = classConfigurationService.getDistinctAcademicYears();
        return ResponseEntity.ok(years);
    }
}
