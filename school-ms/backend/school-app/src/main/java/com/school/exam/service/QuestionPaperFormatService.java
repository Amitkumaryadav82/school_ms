package com.school.exam.service;

import com.school.exam.model.QuestionPaperFormat;
import com.school.exam.repository.QuestionPaperFormatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
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
}
