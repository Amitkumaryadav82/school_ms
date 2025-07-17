package com.school.exam.controller;

import com.school.exam.model.SchoolClass;
import com.school.exam.model.Subject;
import com.school.exam.model.ExamConfig;
import com.school.exam.service.ExamConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api")
public class ExamConfigController {
    @PostMapping("/exam-configs/copy")
    @PreAuthorize("hasRole('ADMIN')")
    public void copyExamConfigs(@RequestBody CopyConfigRequest request) {
        service.copyExamConfigs(request.getSourceClassId(), request.getTargetClassIds());
    }

    public static class CopyConfigRequest {
        private Long sourceClassId;
        private List<Long> targetClassIds;

        public Long getSourceClassId() { return sourceClassId; }
        public void setSourceClassId(Long sourceClassId) { this.sourceClassId = sourceClassId; }
        public List<Long> getTargetClassIds() { return targetClassIds; }
        public void setTargetClassIds(List<Long> targetClassIds) { this.targetClassIds = targetClassIds; }
    }
    @GetMapping("/exam-configs")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ExamConfig> getExamConfigs(@RequestParam Long classId) {
        return service.getExamConfigsByClassId(classId);
    }

    @PostMapping("/exam-configs")
    @PreAuthorize("hasRole('ADMIN')")
    public ExamConfig createExamConfig(@RequestBody ExamConfig config) {
        return service.saveExamConfig(config);
    }

    @DeleteMapping("/exam-configs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteExamConfig(@PathVariable Long id) {
        service.deleteExamConfig(id);
    }
    @Autowired
    private ExamConfigService service;

    @GetMapping("/classes")
    @PreAuthorize("hasRole('ADMIN')")
    public List<SchoolClass> getAllClasses() {
        return service.getAllClasses();
    }

    @GetMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Subject> getAllSubjects() {
        return service.getAllSubjects();
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public Subject createSubject(@RequestBody Subject subject) {
        return service.saveSubject(subject);
    }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Subject updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        subject.setId(id);
        return service.saveSubject(subject);
    }

    @DeleteMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteSubject(@PathVariable Long id) {
        service.deleteSubject(id);
    }
}
