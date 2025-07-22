package com.school.exam.controller;

import com.school.exam.model.Exam;
import com.school.exam.dto.ExamDTO;
import com.school.exam.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/exams")
public class ExamController {
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
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }
}
