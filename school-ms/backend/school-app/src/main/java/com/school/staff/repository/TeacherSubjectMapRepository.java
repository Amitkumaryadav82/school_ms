package com.school.staff.repository;

import com.school.staff.model.TeacherSubjectMap;
import com.school.core.model.TeacherDetails;
import com.school.exam.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherSubjectMapRepository extends JpaRepository<TeacherSubjectMap, Long> {
    List<TeacherSubjectMap> findByTeacherDetails(TeacherDetails teacherDetails);

    List<TeacherSubjectMap> findBySubject(Subject subject);
}
