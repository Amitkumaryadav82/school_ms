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
    public List<BlueprintUnitDTO> getBlueprint(@RequestParam Long classId, @RequestParam Long subjectId) {
        return blueprintService.getBlueprint(classId, subjectId);
    }

    @PostMapping
    public BlueprintUnit addUnit(@RequestBody BlueprintUnit unit) {
        return blueprintService.addUnit(unit);
    }

    @PutMapping("/{id}")
    public BlueprintUnit updateUnit(@PathVariable Long id, @RequestBody BlueprintUnit unit) {
        return blueprintService.updateUnit(id, unit);
    }

    @DeleteMapping("/{id}")
    public void deleteUnit(@PathVariable Long id) {
        blueprintService.deleteUnit(id);
    }

    @DeleteMapping
    public void deleteAllUnits(@RequestParam Long classId, @RequestParam Long subjectId) {
        blueprintService.deleteAllUnits(classId, subjectId);
    }
}
