package com.school.hrm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.school.hrm.entity.Staff;
import com.school.hrm.entity.StaffRole;

@Repository("hrmStaffRepository")
public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByStaffId(String staffId);

    Optional<Staff> findByEmail(String email);    List<Staff> findByRole(StaffRole role);

    List<Staff> findByRoleRoleName(String roleName);

    List<Staff> findByIsActive(Boolean isActive);

    @Query("SELECT s FROM HrmStaff s JOIN s.role r WHERE r.roleName = 'Teacher'")
    List<Staff> findAllTeachers();

    @Query("SELECT s FROM HrmStaff s JOIN s.role r WHERE r.roleName = 'Principal'")
    List<Staff> findAllPrincipals();

    @Query("SELECT s FROM HrmStaff s JOIN s.role r WHERE r.roleName = 'Admin Officer'")
    List<Staff> findAllAdminOfficers();

    @Query("SELECT s FROM HrmStaff s JOIN s.role r WHERE r.roleName = 'Management'")
    List<Staff> findAllManagementStaff();

    @Query("SELECT s FROM HrmStaff s JOIN s.role r WHERE r.roleName = 'Account Officer'")
    List<Staff> findAllAccountOfficers();

    @Query("SELECT s FROM HrmStaff s JOIN s.role r WHERE r.roleName = 'Librarian'")
    List<Staff> findAllLibrarians();
}