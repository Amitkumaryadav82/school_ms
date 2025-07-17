package com.school.exam.service;

import com.school.exam.model.ExamConfig;
import com.school.exam.model.SchoolClass;
import com.school.exam.model.Subject;
import com.school.exam.repository.ExamConfigRepository;
import com.school.exam.repository.SchoolClassRepository;
import com.school.exam.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamConfigService {
    @Autowired
    private ExamConfigRepository examConfigRepository;

    public List<ExamConfig> getExamConfigsByClassId(Long classId) {
        return examConfigRepository.findBySchoolClassId(classId);
    }

    public ExamConfig saveExamConfig(ExamConfig config) {
        List<ExamConfig> existing = examConfigRepository.findBySchoolClassId(config.getSchoolClass().getId());
        for (ExamConfig ec : existing) {
            if (ec.getSubject().getId().equals(config.getSubject().getId())) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Subject already assigned to this class"
                );
            }
        }
        return examConfigRepository.save(config);
    }

    public void deleteExamConfig(Long id) {
        examConfigRepository.deleteById(id);
    }
    @Autowired
    private SchoolClassRepository classRepository;
    @Autowired
    private SubjectRepository subjectRepository;

    public List<SchoolClass> getAllClasses() {
        return classRepository.findAll();
    }
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject saveSubject(Subject subject) {
        return subjectRepository.save(subject);
    }

    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }

    public void copyExamConfigs(Long sourceClassId, List<Long> targetClassIds) {
        List<ExamConfig> sourceConfigs = examConfigRepository.findBySchoolClassId(sourceClassId);
        for (Long targetClassId : targetClassIds) {
            SchoolClass targetClass = classRepository.findById(targetClassId).orElse(null);
            if (targetClass == null) continue;
            for (ExamConfig src : sourceConfigs) {
                boolean exists = examConfigRepository.findBySchoolClassId(targetClassId).stream()
                    .anyMatch(ec -> ec.getSubject().getId().equals(src.getSubject().getId()));
                if (exists) continue;
                ExamConfig copy = new ExamConfig();
                copy.setSchoolClass(targetClass);
                copy.setSubject(src.getSubject());
                copy.setMaxMarks(src.getMaxMarks());
                copy.setTheoryMarks(src.getTheoryMarks());
                copy.setPracticalMarks(src.getPracticalMarks());
                examConfigRepository.save(copy);
            }
        }
    }
}
