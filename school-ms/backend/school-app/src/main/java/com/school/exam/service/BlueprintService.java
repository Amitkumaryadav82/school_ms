package com.school.exam.service;

import com.school.exam.model.BlueprintUnit;
import com.school.exam.model.BlueprintUnitQuestion;
import com.school.exam.repository.BlueprintUnitRepository;
import com.school.exam.repository.BlueprintUnitQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BlueprintService {
    @Autowired
    private BlueprintUnitRepository blueprintUnitRepository;

    @Autowired
    private BlueprintUnitQuestionRepository blueprintUnitQuestionRepository;

    public List<BlueprintUnit> getBlueprint(Long classId, Long subjectId) {
        return blueprintUnitRepository.findBySchoolClassIdAndSubjectId(classId, subjectId);
    }

    public BlueprintUnit addUnit(BlueprintUnit unit) {
        if (unit.getQuestions() != null) {
            for (BlueprintUnitQuestion q : unit.getQuestions()) {
                q.setUnit(unit);
            }
        }
        return blueprintUnitRepository.save(unit);
    }

    public BlueprintUnit updateUnit(Long id, BlueprintUnit unit) {
        unit.setId(id);
        if (unit.getQuestions() != null) {
            for (BlueprintUnitQuestion q : unit.getQuestions()) {
                q.setUnit(unit);
            }
        }
        return blueprintUnitRepository.save(unit);
    }

    public void deleteUnit(Long id) {
        blueprintUnitRepository.deleteById(id);
    }

    public void deleteAllUnits(Long classId, Long subjectId) {
        blueprintUnitRepository.deleteBySchoolClassIdAndSubjectId(classId, subjectId);
    }
}
