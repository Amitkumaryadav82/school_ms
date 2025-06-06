package com.school.exam.controller;

import com.school.exam.dto.ExamBlueprintDTO;
import com.school.exam.service.ExamBlueprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams/blueprints")
public class ExamBlueprintController {

    private final ExamBlueprintService blueprintService;
    
    @Autowired
    public ExamBlueprintController(ExamBlueprintService blueprintService) {
        this.blueprintService = blueprintService;
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamBlueprintDTO> createBlueprint(@RequestBody ExamBlueprintDTO blueprintDTO) {
        ExamBlueprintDTO createdBlueprint = blueprintService.createBlueprint(blueprintDTO);
        return new ResponseEntity<>(createdBlueprint, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamBlueprintDTO> updateBlueprint(
            @PathVariable Long id,
            @RequestBody ExamBlueprintDTO blueprintDTO) {
        ExamBlueprintDTO updatedBlueprint = blueprintService.updateBlueprint(id, blueprintDTO);
        return ResponseEntity.ok(updatedBlueprint);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamBlueprintDTO> getBlueprintById(@PathVariable Long id) {
        ExamBlueprintDTO blueprint = blueprintService.getBlueprintById(id);
        return ResponseEntity.ok(blueprint);
    }
    
    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<List<ExamBlueprintDTO>> getBlueprintsByExamId(@PathVariable Long examId) {
        List<ExamBlueprintDTO> blueprints = blueprintService.getBlueprintsByExamId(examId);
        return ResponseEntity.ok(blueprints);
    }
    
    @PostMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamBlueprintDTO.BlueprintValidationResult> validateBlueprint(
            @PathVariable Long id,
            @RequestParam Long questionPaperId) {
        ExamBlueprintDTO.BlueprintValidationResult result = 
                blueprintService.validateBlueprint(id, questionPaperId);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<ExamBlueprintDTO> approveBlueprint(
            @PathVariable Long id,
            @RequestParam Long approvedBy) {
        ExamBlueprintDTO approvedBlueprint = blueprintService.approveBlueprint(id, approvedBy);
        return ResponseEntity.ok(approvedBlueprint);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<Void> deleteBlueprint(@PathVariable Long id) {
        blueprintService.deleteBlueprint(id);
        return ResponseEntity.noContent().build();
    }
}
