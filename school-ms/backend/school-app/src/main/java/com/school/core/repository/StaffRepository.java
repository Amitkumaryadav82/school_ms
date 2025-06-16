package com.school.core.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.school.core.model.Staff;
import com.school.hrm.entity.StaffRole;

/**
 * Repository for accessing staff data from the database.
 * This is the consolidated repository that replaces:
 * - com.example.schoolms.repository.StaffRepository
 * - com.school.hrm.repository.StaffRepository
 * - com.school.staff.repository.StaffRepository
 */
@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

    /**
     * Find staff member by staffId
     * 
     * @param staffId The staff ID to search for
     * @return Optional containing the staff if found
     */
    Optional<Staff> findByStaffId(String staffId);
    
    /**
     * Find staff member by email
     * 
     * @param email The email to search for
     * @return Optional containing the staff if found
     */
    Optional<Staff> findByEmail(String email);
    
    /**
     * Find all active staff members
     * 
     * @return List of active staff members
     */
    List<Staff> findByIsActiveTrue();
    
    /**
     * Find staff members by role string (legacy method)
     * 
     * @param role The role string
     * @return List of staff with the specified role
     */
    List<Staff> findByRole(String role);
    
    /**
     * Find staff members by active status
     * 
     * @param isActive The active status
     * @return List of staff with the specified active status
     */
    List<Staff> findByIsActive(Boolean isActive);
      /**
     * Find staff members by role name
     * 
     * @param roleName The role name
     * @return List of staff with the specified role name
     */
    @Query("SELECT s FROM CoreStaff s WHERE s.staffRole.roleName = ?1")
    List<Staff> findByRoleName(String roleName);
    
    /**
     * Find staff who are teachers
     * 
     * @return List of staff who are teachers
     */
    @Query("SELECT s FROM CoreStaff s WHERE s.staffRole.roleName = 'Teacher'")
    List<Staff> findAllTeachers();
      /**
     * Find staff by their role entity ID
     * 
     * @param roleId The role entity ID
     * @return List of staff with the specified role ID
     */
    @Query("SELECT s FROM CoreStaff s WHERE s.staffRole.id = ?1")
    List<Staff> findByRoleId(Long roleId);
}
