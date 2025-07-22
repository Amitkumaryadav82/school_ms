package com.school.exam.repository;

import com.school.exam.model.BlueprintUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlueprintUnitRepository extends JpaRepository<BlueprintUnit, Long> {
    @Query("SELECT u FROM BlueprintUnit u JOIN FETCH u.schoolClass JOIN FETCH u.subject JOIN FETCH u.exam LEFT JOIN FETCH u.questions WHERE u.exam.id = :examId AND u.schoolClass.id = :classId AND u.subject.id = :subjectId")
    List<BlueprintUnit> findByExamIdAndSchoolClassIdAndSubjectId(@Param("examId") Long examId, @Param("classId") Long classId, @Param("subjectId") Long subjectId);

    void deleteByExamIdAndSchoolClassIdAndSubjectId(Long examId, Long classId, Long subjectId);
}
