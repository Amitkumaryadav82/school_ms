package com.school.staff.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.school.staff.model.ConsolidatedStaff;
import com.school.staff.model.EmploymentStatus;

/**
 * Consolidated Staff service that combines functionality from both previous implementations.
 * This combines features from:
 * - com.school.hrm.service.StaffService
 * - Any other staff services in the system
 */
public interface ConsolidatedStaffService {

    /**
     * Get all staff members
     * 
     * @return List of all staff
     */
    List<ConsolidatedStaff> getAllStaff();

    /**
     * Get all staff with pagination
     * 
     * @param pageable Pagination information
     * @return Page of staff members
     */
    Page<ConsolidatedStaff> getAllStaffPaginated(Pageable pageable);

    /**
     * Get staff member by ID
     * 
     * @param id Staff ID
     * @return Staff if found, throws exception if not found
     */
    ConsolidatedStaff getStaffById(Long id);

    /**
     * Get staff member by staff ID
     * 
     * @param staffId Staff ID string
     * @return Staff if found, throws exception if not found
     */
    ConsolidatedStaff getStaffByStaffId(String staffId);

    /**
     * Get staff member by email
     * 
     * @param email Email address
     * @return Staff if found, throws exception if not found
     */
    ConsolidatedStaff getStaffByEmail(String email);

    /**
     * Get staff by role
     * 
     * @param roleId Role ID
     * @return List of staff with the given role
     */
    List<ConsolidatedStaff> getStaffByRoleId(Long roleId);

    /**
     * Get active staff
     * 
     * @return List of active staff
     */
    List<ConsolidatedStaff> getActiveStaff();
    
    /**
     * Get staff by role name
     * 
     * @param roleName Role name
     * @return List of staff with the given role
     */
    List<ConsolidatedStaff> getStaffByRoleName(String roleName);

    /**
     * Create a new staff member
     * 
     * @param staff Staff to create
     * @return Created staff with ID
     */
    ConsolidatedStaff createStaff(ConsolidatedStaff staff);

    /**
     * Update an existing staff member
     * 
     * @param id Staff ID to update
     * @param staff Updated staff information
     * @return Updated staff
     */
    ConsolidatedStaff updateStaff(Long id, ConsolidatedStaff staff);

    /**
     * Delete a staff member
     * 
     * @param id Staff ID to delete
     */
    void deleteStaff(Long id);

    /**
     * Deactivate a staff member
     * 
     * @param id Staff ID
     * @return Updated staff
     */
    ConsolidatedStaff deactivateStaff(Long id);

    /**
     * Activate a staff member
     * 
     * @param id Staff ID
     * @return Updated staff
     */
    ConsolidatedStaff activateStaff(Long id);

    /**
     * Update employment status of a staff member
     * 
     * @param id Staff ID
     * @param status New employment status
     * @return Updated staff
     */
    ConsolidatedStaff updateStaffStatus(Long id, EmploymentStatus status);
    
    /**
     * Search staff by name
     * 
     * @param query Search query
     * @return List of staff matching the query
     */
    List<ConsolidatedStaff> searchStaffByName(String query);
    
    /**
     * Get all teachers (staff with role 'TEACHER')
     * 
     * @return List of teachers
     */
    List<ConsolidatedStaff> getAllTeachers();
    
    /**
     * Bulk create staff members
     * 
     * @param staffList List of staff to create
     * @return List of created staff
     */
    List<ConsolidatedStaff> bulkCreateStaff(List<ConsolidatedStaff> staffList);
}
