package com.school.exam.service;

import com.school.exam.model.BlueprintUnit;
import com.school.exam.model.BlueprintUnitQuestion;
import com.school.exam.model.SchoolClass;
import com.school.exam.model.Subject;
import com.school.exam.repository.BlueprintUnitRepository;
import com.school.exam.repository.BlueprintUnitQuestionRepository;
import com.school.exam.dto.BlueprintUnitDTO;
import com.school.exam.dto.BlueprintUnitQuestionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BlueprintService {
    @Autowired
    private BlueprintUnitRepository blueprintUnitRepository;

    @Autowired
    private BlueprintUnitQuestionRepository blueprintUnitQuestionRepository;

    public List<BlueprintUnitDTO> getBlueprint(Long examId, Long classId, Long subjectId) {
        List<BlueprintUnit> units = blueprintUnitRepository.findByExamIdAndSchoolClassIdAndSubjectId(examId, classId,
                subjectId);
        return units.stream().map(this::toDTO).toList();
    }

    private BlueprintUnitDTO toDTO(BlueprintUnit unit) {
        BlueprintUnitDTO dto = new BlueprintUnitDTO();
        dto.setId(unit.getId());
        dto.setName(unit.getName());
        dto.setMarks(unit.getMarks());
        SchoolClass schoolClass = unit.getSchoolClass();
        if (schoolClass != null) {
            dto.setClassId(schoolClass.getId());
            dto.setClassName(schoolClass.getName());
        }
        Subject subject = unit.getSubject();
        if (subject != null) {
            dto.setSubjectId(subject.getId());
            dto.setSubjectName(subject.getName());
        }
        if (unit.getExam() != null) {
            dto.setExamId(unit.getExam().getId());
            dto.setExamName(unit.getExam().getName());
        }
        if (unit.getQuestions() != null) {
            dto.setQuestions(unit.getQuestions().stream().map(this::toQuestionDTO).toList());
        }
        return dto;
    }

    private BlueprintUnitQuestionDTO toQuestionDTO(BlueprintUnitQuestion q) {
        BlueprintUnitQuestionDTO dto = new BlueprintUnitQuestionDTO();
        dto.setId(q.getId());
        dto.setCount(q.getCount());
        dto.setMarksPerQuestion(q.getMarksPerQuestion());
        return dto;
    }

    public BlueprintUnit addUnit(BlueprintUnit unit) {
        if (unit.getQuestions() != null) {
            for (BlueprintUnitQuestion q : unit.getQuestions()) {
                q.setUnit(unit);
            }
        }
        BlueprintUnit saved = blueprintUnitRepository.save(unit);
        // Re-fetch with relations initialized
        return blueprintUnitRepository.findByIdWithRelations(saved.getId());
    }

    public BlueprintUnit updateUnit(Long id, BlueprintUnit unit) {
        unit.setId(id);
        if (unit.getQuestions() != null) {
            for (BlueprintUnitQuestion q : unit.getQuestions()) {
                q.setUnit(unit);
            }
        }
        BlueprintUnit updated = blueprintUnitRepository.save(unit);
        // Re-fetch with relations initialized
        return blueprintUnitRepository.findByIdWithRelations(updated.getId());
    }

    public void deleteUnit(Long id) {
        blueprintUnitRepository.deleteById(id);
    }

    public void deleteAllUnits(Long examId, Long classId, Long subjectId) {
        blueprintUnitRepository.deleteByExamIdAndSchoolClassIdAndSubjectId(examId, classId, subjectId);
    }
}
