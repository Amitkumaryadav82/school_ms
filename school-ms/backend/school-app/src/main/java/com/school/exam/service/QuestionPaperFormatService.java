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
}
