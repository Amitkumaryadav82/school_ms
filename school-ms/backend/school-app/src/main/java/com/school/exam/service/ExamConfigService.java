
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
        // Debug log: incoming subject
        System.out.println("[DEBUG] Incoming subject code: " + subject.getCode() + ", id: " + subject.getId());
        List<Subject> existing = subjectRepository.findAll();
        for (Subject s : existing) {
            System.out.println("[DEBUG] Checking existing subject: id=" + s.getId() + ", code=" + s.getCode());
            if (s.getCode() != null && s.getCode().equals(subject.getCode()) && (subject.getId() == null || !s.getId().equals(subject.getId()))) {
                System.out.println("[DEBUG] Duplicate code found: " + s.getCode());
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Subject code must be unique"
                );
            }
        }
        System.out.println("[DEBUG] No duplicate found, saving subject.");
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
    public List<SchoolClass> getClassesWithExamConfig() {
        return examConfigRepository.findDistinctSchoolClass();
    }


    public List<Subject> getSubjectsForClass(Long classId) {
        return examConfigRepository.findDistinctSubjectBySchoolClassId(classId);
    }

    // Bulk subject upload method (moved inside class)
    public List<Subject> saveSubjectsBulk(List<Subject> subjects, int expectedCount) {
        if (subjects.size() != expectedCount) {
            throw new IllegalArgumentException("Expected count does not match the number of subjects provided");
        }
        // Validate uniqueness of subject codes in the request
        java.util.Set<String> codes = new java.util.HashSet<>();
        for (Subject s : subjects) {
            if (s.getCode() == null || s.getCode().trim().isEmpty()) {
                throw new IllegalArgumentException("Subject code is required for all subjects");
            }
            if (!codes.add(s.getCode())) {
                throw new IllegalArgumentException("Duplicate subject code in upload: " + s.getCode());
            }
        }
        // Validate against existing codes in DB
        List<Subject> existing = subjectRepository.findAll();
        for (Subject s : subjects) {
            for (Subject e : existing) {
                if (e.getCode() != null && e.getCode().equals(s.getCode())) {
                    throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "Subject code already exists: " + s.getCode()
                    );
                }
            }
        }
        return subjectRepository.saveAll(subjects);
    }
}
