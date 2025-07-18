package com.school.exam.repository;

import com.school.exam.model.ExamConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.school.exam.model.SchoolClass;
import com.school.exam.model.Subject;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExamConfigRepository extends JpaRepository<ExamConfig, Long> {
    List<ExamConfig> findBySchoolClassId(Long classId);

    @Query("SELECT DISTINCT e.schoolClass FROM ExamConfig e")
    List<SchoolClass> findDistinctSchoolClass();

    @Query("SELECT DISTINCT e.subject FROM ExamConfig e WHERE e.schoolClass.id = :classId")
    List<Subject> findDistinctSubjectBySchoolClassId(@Param("classId") Long classId);
}
