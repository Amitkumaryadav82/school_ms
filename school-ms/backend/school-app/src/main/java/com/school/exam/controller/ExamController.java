package com.school.exam.controller;

import com.school.exam.model.Exam;
import com.school.exam.dto.ExamDTO;
import com.school.exam.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com.school.exam.exception.BlueprintAttachedException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/exams")
public class ExamController {
    @GetMapping("/{id}/has-blueprints")
    public ResponseEntity<Boolean> hasBlueprints(@PathVariable Long id) {
        boolean hasBlueprints = examService.hasBlueprints(id);
        return ResponseEntity.ok(hasBlueprints);
    }
    @Autowired
    private ExamService examService;

    @GetMapping

    public List<ExamDTO> getAllExams() {
        return examService.getAllExamDTOs();
    }

    @GetMapping("/{id}")

    public ResponseEntity<ExamDTO> getExam(@PathVariable Long id) {
        Optional<ExamDTO> exam = examService.getExamDTO(id);
        return exam.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping

    public ExamDTO createExam(@RequestBody ExamDTO examDTO) {
        return examService.createExamFromDTO(examDTO);
    }

    @PutMapping("/{id}")

    public ExamDTO updateExam(@PathVariable Long id, @RequestBody ExamDTO examDTO) {
        return examService.updateExamFromDTO(id, examDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable Long id) {
        try {
            examService.deleteExam(id);
            return ResponseEntity.noContent().build();
        } catch (BlueprintAttachedException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}
