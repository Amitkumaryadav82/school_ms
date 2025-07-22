package com.example.school.service;

import com.example.school.dto.ExamDTO;
import com.example.school.entity.Exam;
import com.example.school.entity.SchoolClass;
import com.example.school.repository.ExamRepository;
import com.example.school.repository.SchoolClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamService {
    @Autowired
    private ExamRepository examRepository;
    @Autowired
    private SchoolClassRepository classRepository;

    public List<ExamDTO> getAllExams() {
        return examRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<ExamDTO> getExam(Long id) {
        return examRepository.findById(id).map(this::toDTO);
    }

    @Transactional
    public ExamDTO createExam(ExamDTO dto) {
        Exam exam = new Exam();
        exam.setName(dto.getName());
        exam.setDescription(dto.getDescription());
        exam.setStartDate(dto.getStartDate());
        exam.setEndDate(dto.getEndDate());
        Set<SchoolClass> classes = new HashSet<>(classRepository.findAllById(dto.getClassIds()));
        exam.setClasses(classes);
        exam = examRepository.save(exam);
        return toDTO(exam);
    }

    @Transactional
    public ExamDTO updateExam(Long id, ExamDTO dto) {
        Exam exam = examRepository.findById(id).orElseThrow();
        exam.setName(dto.getName());
        exam.setDescription(dto.getDescription());
        exam.setStartDate(dto.getStartDate());
        exam.setEndDate(dto.getEndDate());
        Set<SchoolClass> classes = new HashSet<>(classRepository.findAllById(dto.getClassIds()));
        exam.setClasses(classes);
        exam = examRepository.save(exam);
        return toDTO(exam);
    }

    @Transactional
    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }

    private ExamDTO toDTO(Exam exam) {
        ExamDTO dto = new ExamDTO();
        dto.setId(exam.getId());
        dto.setName(exam.getName());
        dto.setDescription(exam.getDescription());
        dto.setStartDate(exam.getStartDate());
        dto.setEndDate(exam.getEndDate());
        dto.setClassIds(exam.getClasses().stream().map(SchoolClass::getId).collect(Collectors.toSet()));
        return dto;
    }
}
