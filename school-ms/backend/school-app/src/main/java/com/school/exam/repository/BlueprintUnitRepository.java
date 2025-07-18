package com.school.exam.repository;

import com.school.exam.model.BlueprintUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlueprintUnitRepository extends JpaRepository<BlueprintUnit, Long> {
    @Query("SELECT u FROM BlueprintUnit u JOIN FETCH u.schoolClass JOIN FETCH u.subject LEFT JOIN FETCH u.questions WHERE u.schoolClass.id = :classId AND u.subject.id = :subjectId")
    List<BlueprintUnit> findBySchoolClassIdAndSubjectId(@Param("classId") Long classId, @Param("subjectId") Long subjectId);

    void deleteBySchoolClassIdAndSubjectId(Long classId, Long subjectId);
}
