package com.school.staff.repository;

import com.school.staff.model.TeacherClassMap;
import com.school.core.model.TeacherDetails;
import com.school.exam.model.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherClassMapRepository extends JpaRepository<TeacherClassMap, Long> {
    List<TeacherClassMap> findByTeacherDetails(TeacherDetails td);

    List<TeacherClassMap> findBySchoolClassAndSection(SchoolClass c, String section);

    List<TeacherClassMap> findBySchoolClass(SchoolClass c);
}
