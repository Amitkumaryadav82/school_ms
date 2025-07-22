package com.example.school.controller;

import com.example.school.dto.ExamDTO;
import com.example.school.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {
    @Autowired
    private ExamService examService;

    @GetMapping
    public List<ExamDTO> getAllExams() {
        return examService.getAllExams();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamDTO> getExam(@PathVariable Long id) {
        return examService.getExam(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ExamDTO createExam(@RequestBody ExamDTO dto) {
        return examService.createExam(dto);
    }

    @PutMapping("/{id}")
    public ExamDTO updateExam(@PathVariable Long id, @RequestBody ExamDTO dto) {
        return examService.updateExam(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
    }
}
