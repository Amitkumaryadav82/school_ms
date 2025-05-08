package com.example.schoolms.service;

import java.util.List;
import java.util.Optional;

import com.example.schoolms.dto.BulkUploadResponse;
import com.example.schoolms.model.Staff;

/**
 * Service interface for managing staff operations
 */
public interface StaffService {

    /**
     * Get all staff members
     * @return List of all staff
     */
    List<Staff> getAllStaff();

    /**
     * Get a staff member by ID
     * @param id The staff ID
     * @return Optional containing the staff if found
     */
    Optional<Staff> getStaffById(Long id);

    /**
     * Create a new staff member
     * @param staff The staff to create
     * @return The created staff with generated ID
     */
    Staff createStaff(Staff staff);

    /**
     * Update an existing staff member
     * @param id The staff ID
     * @param staffDetails The updated staff details
     * @return Optional containing the updated staff if found
     */
    Optional<Staff> updateStaff(Long id, Staff staffDetails);

    /**
     * Delete a staff member
     * @param id The staff ID
     * @return true if deleted, false if not found
     */
    boolean deleteStaff(Long id);

    /**
     * Find staff by role
     * @param role The role to search for
     * @return List of staff with the specified role
     */
    List<Staff> findByRole(String role);

    /**
     * Find staff by active status
     * @param active The active status to search for
     * @return List of staff with the specified active status
     */
    List<Staff> findByIsActive(boolean active);

    /**
     * Bulk create or update staff
     * @param staffList List of staff to create or update
     * @return Response containing counts of created and updated records, plus any errors
     */
    BulkUploadResponse bulkCreateOrUpdateStaff(List<Staff> staffList);
}