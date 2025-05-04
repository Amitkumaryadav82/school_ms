package com.school.hrm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.school.hrm.entity.Staff;
import com.school.hrm.entity.StaffDesignation;
import com.school.hrm.entity.StaffDesignationMapping;

@Repository
public interface StaffDesignationMappingRepository extends JpaRepository<StaffDesignationMapping, Long> {

    List<StaffDesignationMapping> findByStaff(Staff staff);

    List<StaffDesignationMapping> findByDesignation(StaffDesignation designation);

    List<StaffDesignationMapping> findByStaffAndIsActive(Staff staff, Boolean isActive);

    List<StaffDesignationMapping> findByDesignationAndIsActive(StaffDesignation designation, Boolean isActive);

    Optional<StaffDesignationMapping> findByStaffAndDesignation(Staff staff, StaffDesignation designation);

    @Query("SELECT sdm FROM StaffDesignationMapping sdm WHERE sdm.staff.id = :staffId AND sdm.designation.id = :designationId")
    Optional<StaffDesignationMapping> findByStaffIdAndDesignationId(@Param("staffId") Long staffId,
            @Param("designationId") Long designationId);

    @Query("SELECT sdm FROM StaffDesignationMapping sdm WHERE sdm.designation.name = :designationName AND sdm.isActive = true")
    List<StaffDesignationMapping> findActiveStaffByDesignationName(@Param("designationName") String designationName);

    @Query("SELECT sdm FROM StaffDesignationMapping sdm JOIN sdm.staff s JOIN s.role r WHERE r.roleName = 'Teacher' AND sdm.designation.name = :designationName AND sdm.isActive = true")
    List<StaffDesignationMapping> findActiveTeachersByDesignationName(@Param("designationName") String designationName);
}