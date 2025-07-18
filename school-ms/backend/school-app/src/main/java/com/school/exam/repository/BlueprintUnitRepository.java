package com.school.exam.repository;

import com.school.exam.model.BlueprintUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BlueprintUnitRepository extends JpaRepository<BlueprintUnit, Long> {
    List<BlueprintUnit> findBySchoolClassIdAndSubjectId(Long classId, Long subjectId);
    void deleteBySchoolClassIdAndSubjectId(Long classId, Long subjectId);
}
