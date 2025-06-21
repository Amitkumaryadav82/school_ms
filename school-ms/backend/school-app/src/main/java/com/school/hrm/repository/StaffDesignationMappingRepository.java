package com.school.hrm.repository;

import com.school.hrm.entity.Staff;
import com.school.hrm.entity.StaffDesignation;
import com.school.hrm.entity.StaffDesignationMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @deprecated This repository is being phased out in favor of the consolidated StaffRepository in the core package.
 * This interface is kept for backward compatibility during the migration process.
 */
@Deprecated
@Repository
public interface StaffDesignationMappingRepository extends JpaRepository<StaffDesignationMapping, Long> {
    
    @Query("SELECT m FROM HrmStaffDesignationMapping m WHERE m.staff.id = :staffId")
    List<StaffDesignationMapping> findByStaffId(@Param("staffId") Long staffId);
    
    @Query("SELECT m FROM HrmStaffDesignationMapping m WHERE m.staff.id = :staffId AND m.designation.id = :designationId")
    Optional<StaffDesignationMapping> findByStaffIdAndDesignationId(@Param("staffId") Long staffId, @Param("designationId") Long designationId);
    
    @Query("DELETE FROM HrmStaffDesignationMapping m WHERE m.staff.id = :staffId")
    void deleteByStaffId(@Param("staffId") Long staffId);
    
    List<StaffDesignationMapping> findByDesignationAndIsActive(StaffDesignation designation, boolean isActive);
    
    Optional<StaffDesignationMapping> findByStaffAndDesignation(Staff staff, StaffDesignation designation);
    
    @Query("SELECT m FROM HrmStaffDesignationMapping m JOIN m.staff s JOIN m.designation d WHERE d.name = :designationName AND s.role.roleName = 'Teacher' AND m.isActive = true")
    List<StaffDesignationMapping> findActiveTeachersByDesignationName(@Param("designationName") String designationName);
}
