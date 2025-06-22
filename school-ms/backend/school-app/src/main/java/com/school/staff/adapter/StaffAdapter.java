package com.school.staff.adapter;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.school.common.dto.BulkUploadResponse;
import com.school.common.util.DateConverter;
import com.school.core.model.Staff;
import com.school.core.model.legacy.LegacyStaff;
import com.school.core.service.StaffService;
import com.school.staff.model.TeacherDetails;

/**
 * Adapter class to bridge between old Staff entities and the new consolidated Staff entity.
 * This helps maintain backward compatibility while we migrate to the new model.
 */
@Component
public class StaffAdapter {
    @Autowired
    private StaffService staffService;

    /**
     * Convert legacy staff to consolidated staff entity
     * 
     * @param legacyStaff Staff from legacy model
     * @return Consolidated Staff entity
     */
    public Staff convertFromLegacy(LegacyStaff legacyStaff) {
        if (legacyStaff == null) {
            return null;
        }
        
        Staff staff = new Staff();
        
        staff.setStaffId(legacyStaff.getStaffId());
        staff.setFirstName(legacyStaff.getFirstName());
        staff.setLastName(legacyStaff.getLastName());
        staff.setEmail(legacyStaff.getEmail());
        staff.setPhone(legacyStaff.getPhone());
        staff.setDateOfJoining(DateConverter.convertToLocalDate(legacyStaff.getJoiningDate()));
        staff.setDateOfBirth(DateConverter.convertToLocalDate(legacyStaff.getDateOfBirth()));
        
        // Set other fields as needed
        
        return staff;
    }
    
    /**
     * Get all staff from legacy system
     * @return List of staff DTOs
     */
    public List<com.school.core.dto.StaffDTO> getAllStaffLegacy() {
        List<Staff> staffList = staffService.getAllStaff();
        return convertToDTOList(staffList);
    }
    
    /**
     * Get staff by ID from legacy system
     * @param id Staff ID
     * @return Staff DTO
     */    public com.school.core.dto.StaffDTO getStaffByIdLegacy(Long id) {
        // Handle the Optional return type
        return staffService.getStaffById(id)
            .map(this::convertToDTO)
            .orElse(null);
    }
    
    /**
     * Create staff in legacy system
     * @param legacyStaff Legacy staff model
     * @return Staff DTO
     */
    public com.school.core.dto.StaffDTO createStaffLegacy(com.school.staff.model.Staff legacyStaff) {
        // Convert legacy staff to consolidated model
        Staff staff = new Staff();
        staff.setStaffId(legacyStaff.getStaffId());
        staff.setFirstName(legacyStaff.getFirstName());
        staff.setLastName(legacyStaff.getLastName());
        staff.setEmail(legacyStaff.getEmail());
          // Save using service
        Staff savedStaff = staffService.save(staff);
        return convertToDTO(savedStaff);
    }
    
    /**
     * Update staff in legacy system
     * @param id Staff ID
     * @param legacyStaff Legacy staff model
     * @return Staff DTO
     */    public com.school.core.dto.StaffDTO updateStaffLegacy(Long id, com.school.staff.model.Staff legacyStaff) {
        return staffService.getStaffById(id)
            .map(existingStaff -> {
                existingStaff.setFirstName(legacyStaff.getFirstName());
                existingStaff.setLastName(legacyStaff.getLastName());
                existingStaff.setEmail(legacyStaff.getEmail());                // Update other fields as needed
                
                Staff updatedStaff = staffService.save(existingStaff);
                return convertToDTO(updatedStaff);
            })
            .orElse(null);
    }
    
    /**
     * Delete staff in legacy system
     * @param id Staff ID
     */
    public void deleteStaffLegacy(Long id) {
        staffService.deleteStaff(id);
    }
    
    /**
     * Find staff by role in legacy system
     * @param role Role name
     * @return List of staff DTOs
     */
    public List<com.school.core.dto.StaffDTO> findByRoleLegacy(String role) {
        List<Staff> staffList = staffService.findByRole(role);
        return convertToDTOList(staffList);
    }
    
    /**
     * Find staff by active status in legacy system
     * @param isActive Active status
     * @return List of staff DTOs
     */
    public List<com.school.core.dto.StaffDTO> findByIsActiveLegacy(boolean isActive) {
        List<Staff> staffList = staffService.findByIsActive(isActive);
        return convertToDTOList(staffList);
    }
    
    /**
     * Bulk create or update staff in legacy system
     * @param staffList List of legacy staff models
     * @return BulkUploadResponse
     */
    public BulkUploadResponse bulkCreateOrUpdateStaffLegacy(List<com.school.staff.model.Staff> legacyStaffList) {
        List<Staff> consolidatedStaffList = legacyStaffList.stream()
            .map(legacyStaff -> {
                Staff staff = new Staff();
                staff.setStaffId(legacyStaff.getStaffId());
                staff.setFirstName(legacyStaff.getFirstName());
                staff.setLastName(legacyStaff.getLastName());
                staff.setEmail(legacyStaff.getEmail());
                // Map other fields as needed
                return staff;
            })
            .collect(Collectors.toList());
            
        return staffService.bulkCreateOrUpdateStaff(consolidatedStaffList);
    }
    
    /**
     * Process bulk staff upload from CSV/Excel
     * 
     * @param staffList List of staff from bulk upload
     * @return Response with success/failure counts
     */
    public BulkUploadResponse processBulkUpload(List<Staff> staffList) {
        BulkUploadResponse response = new BulkUploadResponse();
        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();
        
        for (Staff staff : staffList) {            try {
                staffService.save(staff);
                successCount++;
            } catch (Exception e) {
                failureCount++;
                errors.add("Error processing staff " + staff.getStaffId() + ": " + e.getMessage());
            }
        }
        
        response.setSuccessCount(successCount);
        response.setFailureCount(failureCount);
        response.setErrors(errors);
        
        return response;
    }
    
    /**
     * Convert from consolidated Staff to Staff DTO
     * 
     * @param staff Consolidated Staff entity
     * @return StaffDTO for API responses
     */
    public com.school.core.dto.StaffDTO convertToDTO(Staff staff) {
        if (staff == null) return null;
        
        com.school.core.dto.StaffDTO dto = new com.school.core.dto.StaffDTO();
        
        dto.setId(staff.getId());
        dto.setStaffId(staff.getStaffId());
        dto.setFirstName(staff.getFirstName());
        dto.setLastName(staff.getLastName());
        dto.setEmail(staff.getEmail());
        dto.setPhone(staff.getPhone());
        dto.setDesignation(staff.getDesignation());
        dto.setDepartment(staff.getDepartment());
        dto.setEmploymentStatus(staff.getEmploymentStatus());
        dto.setStaffRole(staff.getStaffRole());
        dto.setDateOfJoining(staff.getDateOfJoining());
        dto.setDateOfBirth(staff.getDateOfBirth());
        dto.setGender(staff.getGender());
        
        return dto;
    }
    
    /**
     * Convert a list of Staff entities to DTOs
     * 
     * @param staffList List of Staff entities
     * @return List of StaffDTOs
     */
    public List<com.school.core.dto.StaffDTO> convertToDTOList(List<Staff> staffList) {
        if (staffList == null) return new ArrayList<>();
        
        return staffList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
