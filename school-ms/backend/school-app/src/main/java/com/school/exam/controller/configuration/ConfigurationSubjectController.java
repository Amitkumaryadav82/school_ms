package com.school.exam.controller.configuration;

import com.school.exam.dto.configuration.ConfigurationSubjectDTO;
import com.school.exam.dto.configuration.ConfigurationSubjectRequest;
import com.school.exam.model.configuration.SubjectType;
import com.school.exam.service.configuration.ConfigurationSubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * REST Controller for managing Configuration Subject operations.
 */
@RestController
@RequestMapping("/api/configuration-subjects")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Configuration Subject Management", description = "APIs for managing subject configurations")
public class ConfigurationSubjectController {

    private final ConfigurationSubjectService configurationSubjectService;

    @Operation(summary = "Create a new configuration subject")
    @PostMapping
    public ResponseEntity<ConfigurationSubjectDTO> createConfigurationSubject(@Valid @RequestBody ConfigurationSubjectRequest request) {
        try {
            ConfigurationSubjectDTO created = configurationSubjectService.createConfigurationSubject(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Update an existing configuration subject")
    @PutMapping("/{id}")
    public ResponseEntity<ConfigurationSubjectDTO> updateConfigurationSubject(
            @PathVariable Long id, @Valid @RequestBody ConfigurationSubjectRequest request) {
        try {
            ConfigurationSubjectDTO updated = configurationSubjectService.updateConfigurationSubject(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Get configuration subject by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ConfigurationSubjectDTO> getConfigurationSubjectById(@PathVariable Long id) {
        try {
            ConfigurationSubjectDTO configSubject = configurationSubjectService.getConfigurationSubjectById(id);
            return ResponseEntity.ok(configSubject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get subjects for a class configuration")
    @GetMapping("/class/{classConfigurationId}")
    public ResponseEntity<List<ConfigurationSubjectDTO>> getSubjectsByClassConfiguration(@PathVariable Long classConfigurationId) {
        List<ConfigurationSubjectDTO> subjects = configurationSubjectService.getActiveSubjectsByClassConfiguration(classConfigurationId);
        return ResponseEntity.ok(subjects);
    }

    @Operation(summary = "Get configurations by subject type")
    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<ConfigurationSubjectDTO>> getConfigurationsBySubjectType(@PathVariable SubjectType type) {
        List<ConfigurationSubjectDTO> configurations = configurationSubjectService.getConfigurationsBySubjectType(type);
        return ResponseEntity.ok(configurations);
    }

    @Operation(summary = "Delete a configuration subject")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfigurationSubject(@PathVariable Long id) {
        try {
            configurationSubjectService.deleteConfigurationSubject(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
