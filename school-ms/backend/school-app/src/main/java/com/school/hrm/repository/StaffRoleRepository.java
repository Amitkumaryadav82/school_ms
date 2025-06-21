package com.school.hrm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.school.hrm.entity.StaffRole;

@Repository("hrmStaffRoleRepository")
public interface StaffRoleRepository extends JpaRepository<StaffRole, Long> {
    
    Optional<StaffRole> findByRoleName(String roleName);
    
    List<StaffRole> findByIsActive(Boolean isActive);
}
