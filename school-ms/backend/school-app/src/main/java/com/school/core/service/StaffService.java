package com.school.core.service;

import java.util.List;
import java.util.Optional;

import com.school.common.dto.BulkUploadResponse;
import com.school.core.model.Staff;

/**
 * Service interface for managing staff operations.
 * This is the consolidated service that replaces:
 * - com.example.schoolms.service.StaffService
 * - com.school.hrm.service.StaffService
 * - com.school.staff.service.StaffService
 */
public interface StaffService {

    /**
     * Get all staff members
     * 
     * @return List of all staff
     */
    List<Staff> getAllStaff();

    /**
     * Save a staff member with role synchronization
     * 
     * @param staff The staff to save
     * @return The saved staff
     */
    Staff save(Staff staff);

    /**
     * Save a staff member
     * 
     * @param staff The staff to save
     * @return The saved staff
     */
    Staff saveStaff(Staff staff);

    /**
     * Get a staff member by ID
     * 
     * @param id The staff ID
     * @return Optional containing the staff if found
     */
    Optional<Staff> getStaffById(Long id);

    /**
     * Get a staff member by staffId
     * 
     * @param staffId The staff ID string
     * @return Optional containing the staff if found
     */
    Optional<Staff> getStaffByStaffId(String staffId);

    /**
     * Get a staff member by email
     * 
     * @param email The staff email
     * @return Optional containing the staff if found
     */
    Optional<Staff> getStaffByEmail(String email);

    /**
     * Create a new staff member
     * 
     * @param staff The staff to create
     * @return The created staff with generated ID
     */
    Staff createStaff(Staff staff);

    /**
     * Update an existing staff member
     * 
     * @param staff The updated staff details
     * @return Optional containing the updated staff if found
     */
    Optional<Staff> updateStaff(Staff staff);

    /**
     * Update an existing staff member
     * 
     * @param id           The staff ID
     * @param staffDetails The updated staff details
     * @return Optional containing the updated staff if found
     */
    Optional<Staff> updateStaff(Long id, Staff staffDetails);

    /**
     * Delete a staff member
     * 
     * @param id The staff ID
     * @return true if deleted, false if not found
     */
    boolean deleteStaff(Long id);

    /**
     * Find staff by role
     * 
     * @param role The role to search for
     * @return List of staff with the specified role
     */
    List<Staff> findByRole(String role);

    /**
     * Find staff by active status
     * 
     * @param active The active status to search for
     * @return List of staff with the specified active status
     */
    List<Staff> findByIsActive(boolean isActive);

    /**
     * Find all teachers
     * 
     * @return List of staff who are teachers
     */
    List<Staff> findAllTeachers();

    /**
     * Process a bulk upload of staff
     * 
     * @param request Bulk staff request
     * @return Response with stats about the upload
     */
    // Legacy BulkStaffRequest method removed; use
    // bulkCreateOrUpdateStaff(List<Staff>) directly.

    /**
     * Process a bulk upload of staff from a list
     * 
     * @param staffList List of staff to upload
     * @return Response with stats about the upload
     */
    BulkUploadResponse bulkUploadStaffList(List<Staff> staffList);

    /**
     * Bulk create or update staff
     * 
     * @param staffList List of staff to create or update
     * @return Response containing counts of created and updated records, plus any
     *         errors
     */
    BulkUploadResponse bulkCreateOrUpdateStaff(List<Staff> staffList);
}
