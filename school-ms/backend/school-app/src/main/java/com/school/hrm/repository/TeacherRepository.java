package com.school.hrm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.school.hrm.entity.Staff;
import com.school.hrm.entity.Teacher;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findByStaff(Staff staff);

    List<Teacher> findByDepartment(String department);

    List<Teacher> findBySpecialization(String specialization);

    List<Teacher> findByIsClassTeacher(Boolean isClassTeacher);

    List<Teacher> findByClassAssignedId(Long classId);

    @Query("SELECT t FROM Teacher t WHERE t.staff.id = :staffId")
    Optional<Teacher> findByStaffId(@Param("staffId") Long staffId);

    @Query("SELECT t FROM Teacher t WHERE t.subjects LIKE %:subject%")
    List<Teacher> findBySubject(@Param("subject") String subject);
}