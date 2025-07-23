package com.school.exam.service;

import com.school.exam.model.Exam;
import com.school.exam.repository.ExamRepository;
import com.school.exam.dto.ExamDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.school.exam.model.SchoolClass;
import com.school.exam.repository.SchoolClassRepository;
import java.util.Set;
import java.util.HashSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class ExamService {
    public boolean hasBlueprints(Long examId) {
        return blueprintUnitRepository.countByExamId(examId) > 0;
    }
    private static final Logger log = LoggerFactory.getLogger(ExamService.class);
    @Autowired
    private ExamRepository examRepository;
    @Autowired
    private SchoolClassRepository classRepository;
    @Autowired
    private com.school.exam.repository.BlueprintUnitRepository blueprintUnitRepository;

    public List<ExamDTO> getAllExamDTOs() {
        return examRepository.findAll().stream().map(this::toDTO).toList();
    }

    public Optional<ExamDTO> getExamDTO(Long id) {
        return examRepository.findById(id).map(this::toDTO);
    }

    public ExamDTO createExamFromDTO(ExamDTO dto) {
        Exam exam = new Exam();
        exam.setName(dto.getName());
        exam.setDescription(dto.getDescription());
        exam.setStartDate(dto.getStartDate());
        exam.setEndDate(dto.getEndDate());
        // Save exam without classes to get ID
        exam = examRepository.saveAndFlush(exam);
        // Now set classes and save again
        if (dto.getClassIds() != null && !dto.getClassIds().isEmpty()) {
            Set<Long> ids = dto.getClassIds().stream().map(Integer::longValue)
                    .collect(java.util.stream.Collectors.toSet());
            log.info("Associating Exam with class IDs: {}", ids);
            Set<SchoolClass> classes = new HashSet<>(classRepository.findAllById(ids));
            log.info("Loaded SchoolClass entities: {}", classes.stream().map(SchoolClass::getId).toList());
            exam.setClasses(classes);
            exam = examRepository.save(exam);
        }
        return toDTO(exam);
    }

    public ExamDTO updateExamFromDTO(Long id, ExamDTO dto) {
        Exam exam = fromDTO(dto);
        exam.setId(id);
        exam = examRepository.save(exam);
        return toDTO(exam);
    }

    private ExamDTO toDTO(Exam exam) {
        ExamDTO dto = new ExamDTO();
        dto.setId(exam.getId());
        dto.setName(exam.getName());
        dto.setDescription(exam.getDescription());
        dto.setStartDate(exam.getStartDate());
        dto.setEndDate(exam.getEndDate());
        // Map Set<SchoolClass> to List<Integer> of class IDs
        dto.setClassIds(exam.getClasses().stream().map(c -> c.getId().intValue()).toList());
        return dto;
    }

    private Exam fromDTO(ExamDTO dto) {
        Exam exam = new Exam();
        exam.setId(dto.getId());
        exam.setName(dto.getName());
        exam.setDescription(dto.getDescription());
        exam.setStartDate(dto.getStartDate());
        exam.setEndDate(dto.getEndDate());
        // Map List<Integer> of class IDs to Set<SchoolClass>
        if (dto.getClassIds() != null && !dto.getClassIds().isEmpty()) {
            Set<Long> ids = dto.getClassIds().stream().map(Integer::longValue)
                    .collect(java.util.stream.Collectors.toSet());
            Set<SchoolClass> classes = new HashSet<>(classRepository.findAllById(ids));
            exam.setClasses(classes);
        } else {
            exam.setClasses(new HashSet<>());
        }
        return exam;
    }

    public void deleteExam(Long id) {
        // Directly delete exam; related blueprints will be deleted via ON DELETE CASCADE
        examRepository.deleteById(id);
    }
}
