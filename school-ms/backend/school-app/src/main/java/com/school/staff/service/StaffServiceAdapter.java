package com.school.staff.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.school.common.dto.BulkUploadResponse;
import com.school.common.util.DateConverter;
import com.school.core.model.legacy.LegacyStaff;
import com.school.core.model.legacy.LegacyTeacherDetails;
import com.school.staff.model.Staff;
import com.school.staff.model.TeacherDetails;

/**
 * Adapter class to bridge the gap between the new controller structure
 * and the existing StaffService implementation
 */
@Service
public class StaffServiceAdapter {

    private final StaffService staffService;    /**
     * Autowires the StaffService implementation with qualifier "schoolStaffServiceImpl".
     * This follows the updated standardized qualifier naming convention documented in QUALIFIER-STANDARDIZATION.md
     * 
     * @param staffService the implementation of StaffService from com.school.staff.service.StaffServiceImpl
     */
    @Autowired
    public StaffServiceAdapter(@Qualifier("schoolStaffServiceImpl") StaffService staffService) {
        this.staffService = staffService;
    }

    public List<Staff> getAllStaff() {
        return staffService.getAllStaff();
    }

    public Optional<Staff> getStaffById(Long id) {
        return staffService.getStaffById(id);
    }

    public Staff createStaff(Staff staff) {
        return staffService.createStaff(staff);
    }    /**
     * Bulk create or update staff members
     * Note: This method handles type conversion between the new Staff model and the legacy model
     * 
     * @param staffList List of new Staff model objects
     * @return BulkUploadResponse containing results
     */    public BulkUploadResponse bulkCreateOrUpdateStaff(List<Staff> staffList) {
        // Simply pass the staff list directly to the service which expects the same type
        return staffService.bulkCreateOrUpdateStaff(staffList);
    }
      /**
     * Converts the new Staff model to the legacy Staff model
     * 
     * @param staff The new model staff object
     * @return A legacy model staff object with copied properties
     */
    private LegacyStaff convertToLegacyStaff(Staff staff) {
        LegacyStaff legacyStaff = new LegacyStaff();
        
        legacyStaff.setId(staff.getId());
        legacyStaff.setStaffId(staff.getStaffId());
        legacyStaff.setFirstName(staff.getFirstName());
        legacyStaff.setMiddleName(staff.getMiddleName());
        legacyStaff.setLastName(staff.getLastName());
        legacyStaff.setEmail(staff.getEmail());
        legacyStaff.setPhone(staff.getPhone());
        legacyStaff.setPhoneNumber(staff.getPhoneNumber());
        legacyStaff.setAddress(staff.getAddress());
        legacyStaff.setRole(staff.getRole());
        
        // Convert LocalDate to Date with null checks
        if (staff.getDateOfBirth() != null) {
            legacyStaff.setDateOfBirth(DateConverter.toDate(staff.getDateOfBirth()));
        }
        
        if (staff.getJoiningDate() != null) {
            legacyStaff.setJoiningDate(DateConverter.toDate(staff.getJoiningDate()));
        }
        
        legacyStaff.setDepartment(staff.getDepartment());
        legacyStaff.setActive(staff.isActive());
        
        // Handle TeacherDetails if present
        if (staff.getTeacherDetails() != null) {
            TeacherDetails teacherDetails = staff.getTeacherDetails();
            LegacyTeacherDetails legacyTeacherDetails = new LegacyTeacherDetails();
            
            // Copy TeacherDetails properties
            legacyTeacherDetails.setId(teacherDetails.getId());
            legacyTeacherDetails.setDepartment(teacherDetails.getDepartment());
            legacyTeacherDetails.setQualification(teacherDetails.getQualification());
            legacyTeacherDetails.setSpecialization(teacherDetails.getSpecialization());
            legacyTeacherDetails.setSubjects(teacherDetails.getSubjects());
            legacyTeacherDetails.setYearsOfExperience(teacherDetails.getYearsOfExperience());
            
            // Convert dates with null checks
            if (teacherDetails.getCreatedAt() != null) {
                legacyTeacherDetails.setCreatedAt(DateConverter.toDate(teacherDetails.getCreatedAt()));
            }
            
            if (teacherDetails.getUpdatedAt() != null) {
                legacyTeacherDetails.setUpdatedAt(DateConverter.toDate(teacherDetails.getUpdatedAt()));
            }
            
            legacyStaff.setTeacherDetails(legacyTeacherDetails);
        }
        
        return legacyStaff;
    }

    public Optional<Staff> updateStaff(Long id, Staff staffDetails) {
        return staffService.updateStaff(id, staffDetails);
    }

    public boolean deleteStaff(Long id) {
        return staffService.deleteStaff(id);
    }

    public List<Staff> findByRole(String role) {
        return staffService.findByRole(role);
    }

    public List<Staff> findByIsActive(boolean active) {
        return staffService.findByIsActive(active);
    }
}