package com.school.exam.controller;

import com.school.exam.dto.QPFSummaryDTO;
import com.school.exam.model.QuestionPaperFormat;
import com.school.exam.service.QuestionPaperFormatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    /**
     * Batch save endpoint: Overwrites all rows for given exam/class/subject,
     * deletes removed rows, and saves new/updated ones.
     */
    @PostMapping("/batch")
    public ResponseEntity<List<QuestionPaperFormat>> saveBatch(
            @RequestParam Long examId,
            @RequestParam Long classId,
            @RequestParam Long subjectId,
            @RequestBody List<QuestionPaperFormat> rows) {
        List<QuestionPaperFormat> result = service.saveBatch(examId, classId, subjectId, rows);
        return ResponseEntity.ok(result);
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

    // Summary for UI validation: totals and per-unit aggregates
    @GetMapping("/summary")
    public QPFSummaryDTO summary(@RequestParam Long examId,
            @RequestParam Long classId,
            @RequestParam Long subjectId) {
        return service.getSummary(examId, classId, subjectId);
    }

    // Clone endpoint: copy from src to dest (overwrite dest)
    @PostMapping("/clone")
    public List<QuestionPaperFormat> cloneFrom(@RequestParam Long srcExamId,
            @RequestParam Long srcClassId,
            @RequestParam Long srcSubjectId,
            @RequestParam Long destExamId,
            @RequestParam Long destClassId,
            @RequestParam Long destSubjectId) {
        return service.cloneFrom(srcExamId, srcClassId, srcSubjectId, destExamId, destClassId, destSubjectId);
    }

    // Export CSV for the selected exam/class/subject
    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<String> exportCsv(@RequestParam Long examId,
            @RequestParam Long classId,
            @RequestParam Long subjectId) {
        List<QuestionPaperFormat> rows = service.getByExamClassSubject(examId, classId, subjectId);
        StringBuilder sb = new StringBuilder();
        sb.append("questionNumber,unitName,marks\n");
        for (QuestionPaperFormat r : rows) {
            sb.append(r.getQuestionNumber()).append(',')
                    .append(r.getUnitName() == null ? "" : r.getUnitName().replace(",", " ")).append(',')
                    .append(r.getMarks() == null ? 0 : r.getMarks()).append('\n');
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=question_paper_format.csv");
        return ResponseEntity.ok().headers(headers).body(sb.toString());
    }
}
