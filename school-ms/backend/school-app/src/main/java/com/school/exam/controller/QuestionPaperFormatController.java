package com.school.exam.controller;

import com.school.exam.model.QuestionPaperFormat;
import com.school.exam.service.QuestionPaperFormatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/question-paper-format")
public class QuestionPaperFormatController {
    @Autowired
    private QuestionPaperFormatService service;

    @GetMapping
    public List<QuestionPaperFormat> getByExamClassSubject(@RequestParam Long examId,
            @RequestParam Long classId,
            @RequestParam Long subjectId) {
        return service.getByExamClassSubject(examId, classId, subjectId);
    }

    @PostMapping
    public QuestionPaperFormat create(@RequestBody QuestionPaperFormat qpf) {
        return service.save(qpf);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionPaperFormat> update(@PathVariable Long id, @RequestBody QuestionPaperFormat qpf) {
        Optional<QuestionPaperFormat> existing = service.getById(id);
        if (!existing.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        qpf.setId(id);
        return ResponseEntity.ok(service.save(qpf));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
