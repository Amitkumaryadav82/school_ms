package com.school.exam.controller;

import com.school.exam.model.BlueprintUnit;
import com.school.exam.service.BlueprintService;
import com.school.exam.dto.BlueprintUnitDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/blueprint")
public class BlueprintController {
    @Autowired
    private BlueprintService blueprintService;

    @GetMapping
    public List<BlueprintUnitDTO> getBlueprint(@RequestParam Long examId, @RequestParam Long classId,
            @RequestParam Long subjectId) {
        return blueprintService.getBlueprint(examId, classId, subjectId);
    }

    @PostMapping
    public BlueprintUnitDTO addUnit(@RequestBody BlueprintUnit unit) {
        BlueprintUnit saved = blueprintService.addUnit(unit);
        return toDTO(saved);
    }

    @PutMapping("/{id}")
    public BlueprintUnitDTO updateUnit(@PathVariable Long id, @RequestBody BlueprintUnit unit) {
        BlueprintUnit updated = blueprintService.updateUnit(id, unit);
        return toDTO(updated);
    }

    // Utility method for mapping entity to DTO
    private BlueprintUnitDTO toDTO(BlueprintUnit unit) {
        BlueprintUnitDTO dto = new BlueprintUnitDTO();
        dto.setId(unit.getId());
        dto.setName(unit.getName());
        dto.setMarks(unit.getMarks());
        dto.setClassId(unit.getSchoolClass() != null ? unit.getSchoolClass().getId() : null);
        dto.setSubjectId(unit.getSubject() != null ? unit.getSubject().getId() : null);
        dto.setExamId(unit.getExam() != null ? unit.getExam().getId() : null);
        // Optionally set names if needed
        dto.setClassName(unit.getSchoolClass() != null ? unit.getSchoolClass().getName() : null);
        dto.setSubjectName(unit.getSubject() != null ? unit.getSubject().getName() : null);
        dto.setExamName(unit.getExam() != null ? unit.getExam().getName() : null);
        // Map questions if needed
        dto.setQuestions(null); // Add mapping for questions if required
        return dto;
    }

    @DeleteMapping("/{id}")
    public void deleteUnit(@PathVariable Long id) {
        blueprintService.deleteUnit(id);
    }

    @DeleteMapping
    public void deleteAllUnits(@RequestParam Long examId, @RequestParam Long classId, @RequestParam Long subjectId) {
        blueprintService.deleteAllUnits(examId, classId, subjectId);
    }
}
