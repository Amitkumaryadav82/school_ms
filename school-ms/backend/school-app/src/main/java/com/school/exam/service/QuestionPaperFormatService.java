package com.school.exam.service;

import com.school.exam.dto.QPFSummaryDTO;
import com.school.exam.model.QuestionPaperFormat;
import com.school.exam.repository.QuestionPaperFormatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class QuestionPaperFormatService {
    @Autowired
    private QuestionPaperFormatRepository repository;

    public List<QuestionPaperFormat> getByExamClassSubject(Long examId, Long classId, Long subjectId) {
        return repository.findByExamIdAndClassIdAndSubjectId(examId, classId, subjectId);
    }

    public QuestionPaperFormat save(QuestionPaperFormat qpf) {
        return repository.save(qpf);
    }

    public Optional<QuestionPaperFormat> getById(Long id) {
        return repository.findById(id);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    /**
     * Batch save: Overwrites all rows for given exam/class/subject, deletes removed
     * rows, and saves new/updated ones.
     */
    public List<QuestionPaperFormat> saveBatch(Long examId, Long classId, Long subjectId,
            List<QuestionPaperFormat> rows) {
        // Fetch existing rows
        List<QuestionPaperFormat> existing = repository.findByExamIdAndClassIdAndSubjectId(examId, classId, subjectId);
        // Find IDs to keep and delete
        List<Long> incomingIds = rows.stream()
                .filter(r -> r.getId() != null)
                .map(QuestionPaperFormat::getId)
                .toList();
        // Delete rows that are not in the incoming list
        existing.stream()
                .filter(e -> e.getId() != null && !incomingIds.contains(e.getId()))
                .forEach(e -> repository.deleteById(e.getId()));
        // Set exam/class/subject for all rows (in case frontend omits)
        for (QuestionPaperFormat row : rows) {
            row.setExamId(examId);
            row.setClassId(classId);
            row.setSubjectId(subjectId);
        }
        // Save all (JPA will update or insert as needed)
        return repository.saveAll(rows);
    }

    // Build a summary for UI validation: total questions, total marks, aggregates per unit
    public QPFSummaryDTO getSummary(Long examId, Long classId, Long subjectId) {
        List<QuestionPaperFormat> rows = repository.findByExamIdAndClassIdAndSubjectId(examId, classId, subjectId);
        Map<String, Double> unitTotals = new HashMap<>();
        double totalMarks = 0d;
        for (QuestionPaperFormat r : rows) {
            double m = r.getMarks() != null ? r.getMarks() : 0d;
            totalMarks += m;
            String unit = r.getUnitName() != null ? r.getUnitName() : "";
            unitTotals.put(unit, unitTotals.getOrDefault(unit, 0d) + m);
        }
        return new QPFSummaryDTO(rows.size(), totalMarks, unitTotals);
    }

    // Clone QPF from a source exam/class/subject to a target (overwrite target)
    public List<QuestionPaperFormat> cloneFrom(Long srcExamId, Long srcClassId, Long srcSubjectId,
                                               Long destExamId, Long destClassId, Long destSubjectId) {
        // delete existing target rows
        List<QuestionPaperFormat> existing = repository.findByExamIdAndClassIdAndSubjectId(destExamId, destClassId, destSubjectId);
        for (QuestionPaperFormat e : existing) {
            if (e.getId() != null) repository.deleteById(e.getId());
        }
        // copy source rows
        List<QuestionPaperFormat> src = repository.findByExamIdAndClassIdAndSubjectId(srcExamId, srcClassId, srcSubjectId);
        List<QuestionPaperFormat> copies = new ArrayList<>();
        for (QuestionPaperFormat r : src) {
            QuestionPaperFormat n = new QuestionPaperFormat();
            n.setExamId(destExamId);
            n.setClassId(destClassId);
            n.setSubjectId(destSubjectId);
            n.setQuestionNumber(r.getQuestionNumber());
            n.setUnitName(r.getUnitName());
            n.setMarks(r.getMarks());
            copies.add(n);
        }
        return repository.saveAll(copies);
    }
}
