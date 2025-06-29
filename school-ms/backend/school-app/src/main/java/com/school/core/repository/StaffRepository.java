package com.school.core.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.school.core.model.Staff;
import com.school.core.model.StaffRole;

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
     * Find staff by ID with eager loading of StaffRole
     * 
     * @param id The staff ID
     * @return Optional containing the staff with eagerly loaded StaffRole if found
     */
    @Query("SELECT s FROM CoreStaff s LEFT JOIN FETCH s.staffRole WHERE s.id = ?1")
    Optional<Staff> findByIdWithRole(Long id);

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
     * Find all active staff members (based on employment status)
     * 
     * @return List of active staff members
     */
    @Query("SELECT s FROM CoreStaff s WHERE s.employmentStatus = com.school.core.model.EmploymentStatus.ACTIVE")
    List<Staff> findByIsActiveTrue();
    
    /**
     * Find all active staff members with eager loading of StaffRole
     * This uses employment_status = 'ACTIVE' instead of isActive flag
     * 
     * @return List of active staff members with eagerly loaded StaffRole
     */
    @Query("SELECT s FROM CoreStaff s LEFT JOIN FETCH s.staffRole WHERE s.employmentStatus = com.school.core.model.EmploymentStatus.ACTIVE")
    List<Staff> findAllActiveStaffWithRole();
    
    /**
     * Find staff members by role string (legacy method)
     * 
     * @param role The role string
     * @return List of staff with the specified role
     */
    List<Staff> findByRole(String role);
    
    /**
     * Find staff members by active status
     * This now uses employment_status instead of isActive flag
     * 
     * @param isActive The active status (true = ACTIVE, false = TERMINATED)
     * @return List of staff with the specified active status
     */
    @Query("SELECT s FROM CoreStaff s WHERE (:isActive = true AND s.employmentStatus = 'ACTIVE') OR (:isActive = false AND s.employmentStatus = 'TERMINATED')")
    List<Staff> findByIsActive(Boolean isActive);    /**
     * Find staff members by role name
     * 
     * @param roleName The role name
     * @return List of staff with the specified role name
     */
    @Query("SELECT s FROM CoreStaff s WHERE s.staffRole.name = ?1")
    List<Staff> findByRoleName(String roleName);
      /**
     * Find staff who are teachers
     * 
     * @return List of staff who are teachers
     */
    @Query("SELECT s FROM CoreStaff s WHERE s.staffRole.name = 'Teacher'")
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
