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

    private final StaffService coreStaffService;
      @Autowired
    public StaffAdapter(@org.springframework.beans.factory.annotation.Qualifier("coreStaffServiceImpl") StaffService coreStaffService) {
        this.coreStaffService = coreStaffService;
    }
      /**
     * Convert from legacy com.school.staff.model.Staff to consolidated Staff
     */
    public Staff convertToCore(com.school.staff.model.Staff legacyStaff) {
        if (legacyStaff == null) {
            return null;
        }
        
        return Staff.builder()
            .id(legacyStaff.getId())
            .staffId(legacyStaff.getStaffId())
            .firstName(legacyStaff.getFirstName())
            .middleName(legacyStaff.getMiddleName())
            .lastName(legacyStaff.getLastName())
            .email(legacyStaff.getEmail())
            .phone(legacyStaff.getPhone())
            .phoneNumber(legacyStaff.getPhoneNumber())
            .address(legacyStaff.getAddress())
            .role(legacyStaff.getRole())
            .dateOfBirth(legacyStaff.getDateOfBirth())
            .joinDate(legacyStaff.getJoiningDate())
            .joiningDate(legacyStaff.getJoiningDate())
            .department(legacyStaff.getDepartment())
            .isActive(legacyStaff.isActive())
            .active(legacyStaff.isActive())
            // Need to convert the TeacherDetails from one type to another
            .teacherDetails(convertTeacherDetails(legacyStaff.getTeacherDetails()))
            .build();
    }
    
    /**
     * Convert from consolidated Staff to legacy com.school.staff.model.Staff
     */
    public com.school.staff.model.Staff convertToLegacy(Staff coreStaff) {
        if (coreStaff == null) {
            return null;
        }
        
        com.school.staff.model.Staff legacyStaff = new com.school.staff.model.Staff();
        legacyStaff.setId(coreStaff.getId());
        legacyStaff.setStaffId(coreStaff.getStaffId());
        legacyStaff.setFirstName(coreStaff.getFirstName());
        legacyStaff.setMiddleName(coreStaff.getMiddleName());
        legacyStaff.setLastName(coreStaff.getLastName());
        legacyStaff.setEmail(coreStaff.getEmail());        legacyStaff.setPhone(coreStaff.getPhone());
        legacyStaff.setPhoneNumber(coreStaff.getPhoneNumber());
        legacyStaff.setAddress(coreStaff.getAddress());        legacyStaff.setRole(coreStaff.getRole());
        legacyStaff.setDateOfBirth(coreStaff.getDateOfBirth());
        legacyStaff.setJoiningDate(coreStaff.getJoiningDate());
        legacyStaff.setDepartment(coreStaff.getDepartment());
        legacyStaff.setActive(coreStaff.isActive());
          // Handle teacher details if present
        if (coreStaff.getTeacherDetails() != null) {
            legacyStaff.setTeacherDetails(convertToLegacyTeacherDetails(coreStaff.getTeacherDetails()));
        }
        
        return legacyStaff;
    }
      /**
     * Convert from LegacyStaff to core Staff model
     */
    public Staff convertFromLegacyToCore(LegacyStaff legacyStaff) {
        if (legacyStaff == null) {
            return null;
        }
          
        Staff.StaffBuilder builder = Staff.builder()
            .id(legacyStaff.getId())
            .staffId(legacyStaff.getStaffId())
            .firstName(legacyStaff.getFirstName())
            .middleName(legacyStaff.getMiddleName())
            .lastName(legacyStaff.getLastName())
            .email(legacyStaff.getEmail())
            .phone(legacyStaff.getPhone())
            .phoneNumber(legacyStaff.getPhoneNumber())
            .address(legacyStaff.getAddress())
            .role(legacyStaff.getRole())
            .department(legacyStaff.getDepartment())
            .isActive(legacyStaff.isActive())
            .active(legacyStaff.isActive());
            
        // Handle date conversions with null checks
        if (legacyStaff.getDateOfBirth() != null) {
            builder.dateOfBirth(DateConverter.toLocalDate(legacyStaff.getDateOfBirth()));
        }
        
        if (legacyStaff.getJoiningDate() != null) {
            builder.joinDate(DateConverter.toLocalDate(legacyStaff.getJoiningDate()));
            builder.joiningDate(DateConverter.toLocalDate(legacyStaff.getJoiningDate()));
        }
        
        return builder.build();
    }
    
    /**
     * Convert from legacy com.school.hrm.entity.Staff to consolidated Staff
     */
    public Staff convertFromHrmToCore(com.school.hrm.entity.Staff hrmStaff) {
        if (hrmStaff == null) {
            return null;
        }
        
        return Staff.builder()
            .id(hrmStaff.getId())
            .staffId(hrmStaff.getStaffId())
            .firstName(hrmStaff.getFirstName())
            .lastName(hrmStaff.getLastName())
            .email(hrmStaff.getEmail())
            .phoneNumber(hrmStaff.getPhoneNumber())
            .address(hrmStaff.getAddress())
            .dateOfBirth(hrmStaff.getDateOfBirth())
            .gender(hrmStaff.getGender())
            .joinDate(hrmStaff.getJoinDate())
            .terminationDate(hrmStaff.getTerminationDate())
            .employmentStatus(hrmStaff.getEmploymentStatus())
            .staffRole(hrmStaff.getRole())
            .userId(hrmStaff.getUserId())
            .isActive(hrmStaff.getIsActive())
            .qualifications(hrmStaff.getQualifications())
            .emergencyContact(hrmStaff.getEmergencyContact())
            .bloodGroup(hrmStaff.getBloodGroup())
            .profileImage(hrmStaff.getProfileImage())
            .pfUAN(hrmStaff.getPfUAN())
            .gratuity(hrmStaff.getGratuity())
            .serviceEndDate(hrmStaff.getServiceEndDate())
            .basicSalary(hrmStaff.getBasicSalary())
            .hra(hrmStaff.getHra())
            .da(hrmStaff.getDa())
            .build();
    }
    
    /**
     * Convert list of legacy Staff to consolidated Staff
     */
    public List<Staff> convertListToCore(List<com.school.staff.model.Staff> legacyStaffList) {
        if (legacyStaffList == null) {
            return new ArrayList<>();
        }
        return legacyStaffList.stream()
                .map(this::convertToCore)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert list of consolidated Staff to legacy Staff
     */
    public List<com.school.staff.model.Staff> convertListToLegacy(List<Staff> coreStaffList) {
        if (coreStaffList == null) {
            return new ArrayList<>();
        }
        return coreStaffList.stream()
                .map(this::convertToLegacy)
                .collect(Collectors.toList());
    }
    
    // Legacy interface methods that delegate to the core service
    
    public List<com.school.staff.model.Staff> getAllStaffLegacy() {
        return convertListToLegacy(coreStaffService.getAllStaff());
    }
    
    public Optional<com.school.staff.model.Staff> getStaffByIdLegacy(Long id) {
        return coreStaffService.getStaffById(id)
                .map(this::convertToLegacy);
    }
    
    public com.school.staff.model.Staff createStaffLegacy(com.school.staff.model.Staff staff) {
        Staff coreStaff = convertToCore(staff);
        Staff savedStaff = coreStaffService.createStaff(coreStaff);
        return convertToLegacy(savedStaff);
    }
    
    public Optional<com.school.staff.model.Staff> updateStaffLegacy(Long id, com.school.staff.model.Staff staffDetails) {
        Staff coreStaffDetails = convertToCore(staffDetails);
        return coreStaffService.updateStaff(id, coreStaffDetails)
                .map(this::convertToLegacy);
    }
    
    public boolean deleteStaffLegacy(Long id) {
        return coreStaffService.deleteStaff(id);
    }
    
    public List<com.school.staff.model.Staff> findByRoleLegacy(String role) {
        return convertListToLegacy(coreStaffService.findByRole(role));
    }
    
    public List<com.school.staff.model.Staff> findByIsActiveLegacy(boolean active) {
        return convertListToLegacy(coreStaffService.findByIsActive(active));
    }
    
    public BulkUploadResponse bulkCreateOrUpdateStaffLegacy(List<com.school.staff.model.Staff> staffList) {
        List<Staff> coreStaffList = convertListToCore(staffList);
        return coreStaffService.bulkCreateOrUpdateStaff(coreStaffList);
    }
    
    /**
     * Convert from legacy TeacherDetails to core TeacherDetails
     */
    private com.school.core.model.TeacherDetails convertTeacherDetails(com.school.staff.model.TeacherDetails legacyDetails) {
        if (legacyDetails == null) {
            return null;
        }
        
        com.school.core.model.TeacherDetails coreDetails = new com.school.core.model.TeacherDetails();
        coreDetails.setId(legacyDetails.getId());
        coreDetails.setDepartment(legacyDetails.getDepartment());
        coreDetails.setQualification(legacyDetails.getQualification());
        coreDetails.setSpecialization(legacyDetails.getSpecialization());
        coreDetails.setSubjects(legacyDetails.getSubjects());
        coreDetails.setYearsOfExperience(legacyDetails.getYearsOfExperience());
          // Both models use LocalDateTime, so no conversion needed
        coreDetails.setCreatedAt(legacyDetails.getCreatedAt());
        coreDetails.setUpdatedAt(legacyDetails.getUpdatedAt());
        
        return coreDetails;
    }
    
    /**
     * Convert from core TeacherDetails to legacy TeacherDetails
     */
    private com.school.staff.model.TeacherDetails convertToLegacyTeacherDetails(com.school.core.model.TeacherDetails coreDetails) {
        if (coreDetails == null) {
            return null;
        }
        
        com.school.staff.model.TeacherDetails legacyDetails = new com.school.staff.model.TeacherDetails();
        legacyDetails.setId(coreDetails.getId());
        legacyDetails.setDepartment(coreDetails.getDepartment());
        legacyDetails.setQualification(coreDetails.getQualification());
        legacyDetails.setSpecialization(coreDetails.getSpecialization());
        legacyDetails.setSubjects(coreDetails.getSubjects());
        legacyDetails.setYearsOfExperience(coreDetails.getYearsOfExperience());
          // Both models use LocalDateTime, so no conversion needed
        legacyDetails.setCreatedAt(coreDetails.getCreatedAt());
        legacyDetails.setUpdatedAt(coreDetails.getUpdatedAt());
        
        return legacyDetails;
    }
}
