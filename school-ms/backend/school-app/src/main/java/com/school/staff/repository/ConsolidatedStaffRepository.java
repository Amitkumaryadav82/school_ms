package com.school.staff.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.school.staff.model.ConsolidatedStaff;
import com.school.staff.model.EmploymentStatus;

import java.util.List;
import java.util.Optional;

/**
 * Consolidated Staff repository that combines functionality from both previous implementations.
 * This combines features from:
 * - com.school.hrm.repository.StaffRepository
 * - Any other staff repositories in the system
 */
@Repository
public interface ConsolidatedStaffRepository extends JpaRepository<ConsolidatedStaff, Long> {
    
    /**
     * Find staff by staff ID
     * 
     * @param staffId The staff ID
     * @return Optional staff
     */
    Optional<ConsolidatedStaff> findByStaffId(String staffId);
    
    /**
     * Find staff by email
     * 
     * @param email The email address
     * @return Optional staff
     */
    Optional<ConsolidatedStaff> findByEmail(String email);
    
    /**
     * Find staff by role ID
     * 
     * @param roleId The role ID
     * @return List of staff with the given role
     */
    List<ConsolidatedStaff> findByRoleId(Long roleId);
    
    /**
     * Find active staff
     * 
     * @return List of active staff
     */
    List<ConsolidatedStaff> findByIsActiveTrue();
    
    /**
     * Find staff by employment status
     * 
     * @param status The employment status
     * @return List of staff with the given status
     */
    List<ConsolidatedStaff> findByEmploymentStatus(EmploymentStatus status);
    
    /**
     * Search staff by name
     * 
     * @param query The search query
     * @return List of staff matching the query
     */
    @Query("SELECT s FROM ConsolidatedStaff s WHERE " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CONCAT(s.firstName, ' ', s.lastName)) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ConsolidatedStaff> searchByName(@Param("query") String query);
    
    /**
     * Find staff by role ID with pagination
     * 
     * @param roleId The role ID
     * @param pageable Pagination information
     * @return Page of staff with the given role
     */
    Page<ConsolidatedStaff> findByRoleId(Long roleId, Pageable pageable);
}
