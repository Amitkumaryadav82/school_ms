package com.school.staff.adapter;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.Optional;

import com.school.core.model.Staff;
import com.school.core.repository.StaffRepository;
import com.school.core.service.StaffService;
import com.school.hrm.entity.StaffRole;
import com.school.hrm.model.EmploymentStatus;

/**
 * Adapter class to facilitate migration from legacy Staff entities to the consolidated Staff entity.
 * This class provides methods to convert between legacy Staff entities and the new consolidated Staff entity.
 */
@Component
public class StaffEntityAdapter {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private StaffService staffService;

    /**
     * Converts a legacy HRM Staff entity to the consolidated Staff entity.
     * 
     * @param hrmStaff The legacy HRM Staff entity
     * @return A consolidated Staff entity with data from the legacy Staff entity
     */
    public Staff fromHrmStaff(com.school.hrm.entity.Staff hrmStaff) {
        if (hrmStaff == null) {
            return null;
        }
        
        // Check if a consolidated staff with this staffId already exists
        Optional<Staff> existingStaff = staffRepository.findByStaffId(hrmStaff.getStaffId());
        if (existingStaff.isPresent()) {
            return updateFromHrmStaff(existingStaff.get(), hrmStaff);
        }
        
        Staff staff = new Staff();
        staff.setStaffId(hrmStaff.getStaffId());
        staff.setFirstName(hrmStaff.getFirstName());
        staff.setLastName(hrmStaff.getLastName());
        staff.setEmail(hrmStaff.getEmail());
        staff.setPhoneNumber(hrmStaff.getPhoneNumber());
        staff.setAddress(hrmStaff.getAddress());
        staff.setDateOfBirth(hrmStaff.getDateOfBirth());
        staff.setGender(hrmStaff.getGender());
        staff.setJoinDate(hrmStaff.getJoinDate());
        staff.setTerminationDate(hrmStaff.getTerminationDate());
        staff.setEmploymentStatus(hrmStaff.getEmploymentStatus());
        staff.setStaffRole(hrmStaff.getRole());
        staff.setUserId(hrmStaff.getUserId());
        staff.setActive(hrmStaff.getIsActive());
        staff.setQualifications(hrmStaff.getQualifications());
        staff.setEmergencyContact(hrmStaff.getEmergencyContact());
        staff.setBloodGroup(hrmStaff.getBloodGroup());
        staff.setProfileImage(hrmStaff.getProfileImage());
        staff.setPfUAN(hrmStaff.getPfUAN());
        staff.setGratuity(hrmStaff.getGratuity());
        staff.setServiceEndDate(hrmStaff.getServiceEndDate());
        staff.setBasicSalary(hrmStaff.getBasicSalary());
        
        return staff;
    }
    
    /**
     * Updates an existing consolidated Staff entity with data from a legacy HRM Staff entity.
     * 
     * @param staff The consolidated Staff entity to update
     * @param hrmStaff The legacy HRM Staff entity to get data from
     * @return The updated consolidated Staff entity
     */
    public Staff updateFromHrmStaff(Staff staff, com.school.hrm.entity.Staff hrmStaff) {
        if (staff == null || hrmStaff == null) {
            return staff;
        }
        
        // Only update fields that exist in the hrm Staff
        if (hrmStaff.getFirstName() != null) staff.setFirstName(hrmStaff.getFirstName());
        if (hrmStaff.getLastName() != null) staff.setLastName(hrmStaff.getLastName());
        if (hrmStaff.getEmail() != null) staff.setEmail(hrmStaff.getEmail());
        if (hrmStaff.getPhoneNumber() != null) staff.setPhoneNumber(hrmStaff.getPhoneNumber());
        if (hrmStaff.getAddress() != null) staff.setAddress(hrmStaff.getAddress());
        if (hrmStaff.getDateOfBirth() != null) staff.setDateOfBirth(hrmStaff.getDateOfBirth());
        if (hrmStaff.getGender() != null) staff.setGender(hrmStaff.getGender());
        if (hrmStaff.getJoinDate() != null) {
            staff.setJoinDate(hrmStaff.getJoinDate());
            staff.setJoiningDate(hrmStaff.getJoinDate()); // Keep both fields in sync
        }
        if (hrmStaff.getTerminationDate() != null) staff.setTerminationDate(hrmStaff.getTerminationDate());
        if (hrmStaff.getEmploymentStatus() != null) staff.setEmploymentStatus(hrmStaff.getEmploymentStatus());
        if (hrmStaff.getRole() != null) staff.setStaffRole(hrmStaff.getRole());
        if (hrmStaff.getUserId() != null) staff.setUserId(hrmStaff.getUserId());
        if (hrmStaff.getIsActive() != null) staff.setActive(hrmStaff.getIsActive());
        if (hrmStaff.getQualifications() != null) staff.setQualifications(hrmStaff.getQualifications());
        if (hrmStaff.getEmergencyContact() != null) staff.setEmergencyContact(hrmStaff.getEmergencyContact());
        if (hrmStaff.getBloodGroup() != null) staff.setBloodGroup(hrmStaff.getBloodGroup());
        if (hrmStaff.getProfileImage() != null) staff.setProfileImage(hrmStaff.getProfileImage());
        if (hrmStaff.getPfUAN() != null) staff.setPfUAN(hrmStaff.getPfUAN());
        if (hrmStaff.getGratuity() != null) staff.setGratuity(hrmStaff.getGratuity());
        if (hrmStaff.getServiceEndDate() != null) staff.setServiceEndDate(hrmStaff.getServiceEndDate());
        if (hrmStaff.getBasicSalary() != null) staff.setBasicSalary(hrmStaff.getBasicSalary());
        
        return staff;
    }
    
    /**
     * Converts a legacy Staff entity from staff package to the consolidated Staff entity.
     * 
     * @param legacyStaff The legacy Staff entity from staff package
     * @return A consolidated Staff entity with data from the legacy Staff entity
     */
    public Staff fromLegacyStaff(com.school.staff.model.Staff legacyStaff) {
        if (legacyStaff == null) {
            return null;
        }
        
        // Check if a consolidated staff with this staffId already exists
        Optional<Staff> existingStaff = staffRepository.findByStaffId(legacyStaff.getStaffId());
        if (existingStaff.isPresent()) {
            return updateFromLegacyStaff(existingStaff.get(), legacyStaff);
        }
        
        Staff staff = new Staff();
        staff.setStaffId(legacyStaff.getStaffId());
        staff.setFirstName(legacyStaff.getFirstName());
        staff.setMiddleName(legacyStaff.getMiddleName());
        staff.setLastName(legacyStaff.getLastName());
        staff.setEmail(legacyStaff.getEmail());
        staff.setPhone(legacyStaff.getPhone());
        staff.setPhoneNumber(legacyStaff.getPhoneNumber());
        staff.setAddress(legacyStaff.getAddress());
        // Map other fields as needed
        
        return staff;
    }
    
    /**
     * Updates an existing consolidated Staff entity with data from a legacy Staff entity.
     * 
     * @param staff The consolidated Staff entity to update
     * @param legacyStaff The legacy Staff entity to get data from
     * @return The updated consolidated Staff entity
     */
    public Staff updateFromLegacyStaff(Staff staff, com.school.staff.model.Staff legacyStaff) {
        if (staff == null || legacyStaff == null) {
            return staff;
        }
        
        // Only update fields that exist in the legacy Staff
        if (legacyStaff.getFirstName() != null) staff.setFirstName(legacyStaff.getFirstName());
        if (legacyStaff.getMiddleName() != null) staff.setMiddleName(legacyStaff.getMiddleName());
        if (legacyStaff.getLastName() != null) staff.setLastName(legacyStaff.getLastName());
        if (legacyStaff.getEmail() != null) staff.setEmail(legacyStaff.getEmail());
        if (legacyStaff.getPhone() != null) staff.setPhone(legacyStaff.getPhone());
        if (legacyStaff.getPhoneNumber() != null) staff.setPhoneNumber(legacyStaff.getPhoneNumber());
        if (legacyStaff.getAddress() != null) staff.setAddress(legacyStaff.getAddress());
        // Map other fields as needed
        
        return staff;
    }
    
    /**
     * Converts a consolidated Staff entity to a legacy HRM Staff entity.
     * This is mainly for backward compatibility with existing code.
     * 
     * @param staff The consolidated Staff entity
     * @return A legacy HRM Staff entity with data from the consolidated Staff entity
     */
    public com.school.hrm.entity.Staff toHrmStaff(Staff staff) {
        if (staff == null) {
            return null;
        }
        
        com.school.hrm.entity.Staff hrmStaff = new com.school.hrm.entity.Staff();
        hrmStaff.setStaffId(staff.getStaffId());
        hrmStaff.setFirstName(staff.getFirstName());
        hrmStaff.setLastName(staff.getLastName());
        hrmStaff.setEmail(staff.getEmail());
        hrmStaff.setPhoneNumber(staff.getPhoneNumber());
        hrmStaff.setAddress(staff.getAddress());
        hrmStaff.setDateOfBirth(staff.getDateOfBirth());
        hrmStaff.setGender(staff.getGender());
        hrmStaff.setJoinDate(staff.getJoinDate());
        hrmStaff.setTerminationDate(staff.getTerminationDate());
        hrmStaff.setEmploymentStatus(staff.getEmploymentStatus());        hrmStaff.setRole(staff.getStaffRole());
        hrmStaff.setUserId(staff.getUserId());
        hrmStaff.setIsActive(staff.isActive());
        hrmStaff.setQualifications(staff.getQualifications());
        hrmStaff.setEmergencyContact(staff.getEmergencyContact());
        hrmStaff.setBloodGroup(staff.getBloodGroup());
        hrmStaff.setProfileImage(staff.getProfileImage());
        hrmStaff.setPfUAN(staff.getPfUAN());
        hrmStaff.setGratuity(staff.getGratuity());
        hrmStaff.setServiceEndDate(staff.getServiceEndDate());
        hrmStaff.setBasicSalary(staff.getBasicSalary());
        
        return hrmStaff;
    }
    
    /**
     * Converts a consolidated Staff entity to a legacy Staff entity from staff package.
     * This is mainly for backward compatibility with existing code.
     * 
     * @param staff The consolidated Staff entity
     * @return A legacy Staff entity from staff package with data from the consolidated Staff entity
     */
    public com.school.staff.model.Staff toLegacyStaff(Staff staff) {
        if (staff == null) {
            return null;
        }
        
        com.school.staff.model.Staff legacyStaff = new com.school.staff.model.Staff();
        legacyStaff.setStaffId(staff.getStaffId());
        legacyStaff.setFirstName(staff.getFirstName());
        legacyStaff.setMiddleName(staff.getMiddleName());
        legacyStaff.setLastName(staff.getLastName());
        legacyStaff.setEmail(staff.getEmail());
        legacyStaff.setPhone(staff.getPhone());
        legacyStaff.setPhoneNumber(staff.getPhoneNumber());
        legacyStaff.setAddress(staff.getAddress());
        // Map other fields as needed
        
        return legacyStaff;
    }
    
    /**
     * Converts a list of legacy HRM Staff entities to a list of consolidated Staff entities.
     * 
     * @param hrmStaffList List of legacy HRM Staff entities
     * @return List of consolidated Staff entities
     */
    public List<Staff> fromHrmStaffList(List<com.school.hrm.entity.Staff> hrmStaffList) {
        if (hrmStaffList == null) {
            return new ArrayList<>();
        }
        
        return hrmStaffList.stream()
                .map(this::fromHrmStaff)
                .collect(Collectors.toList());
    }
    
    /**
     * Converts a list of legacy Staff entities from staff package to a list of consolidated Staff entities.
     * 
     * @param legacyStaffList List of legacy Staff entities from staff package
     * @return List of consolidated Staff entities
     */
    public List<Staff> fromLegacyStaffList(List<com.school.staff.model.Staff> legacyStaffList) {
        if (legacyStaffList == null) {
            return new ArrayList<>();
        }
        
        return legacyStaffList.stream()
                .map(this::fromLegacyStaff)
                .collect(Collectors.toList());
    }
    
    /**
     * Converts a list of consolidated Staff entities to a list of legacy HRM Staff entities.
     * 
     * @param staffList List of consolidated Staff entities
     * @return List of legacy HRM Staff entities
     */
    public List<com.school.hrm.entity.Staff> toHrmStaffList(List<Staff> staffList) {
        if (staffList == null) {
            return new ArrayList<>();
        }
        
        return staffList.stream()
                .map(this::toHrmStaff)
                .collect(Collectors.toList());
    }
    
    /**
     * Converts a list of consolidated Staff entities to a list of legacy Staff entities from staff package.
     * 
     * @param staffList List of consolidated Staff entities
     * @return List of legacy Staff entities from staff package
     */
    public List<com.school.staff.model.Staff> toLegacyStaffList(List<Staff> staffList) {
        if (staffList == null) {
            return new ArrayList<>();
        }
        
        return staffList.stream()
                .map(this::toLegacyStaff)
                .collect(Collectors.toList());
    }
    
    /**
     * Converts a Core Staff model to HRM StaffDTO
     * 
     * @param staff Core Staff entity
     * @return StaffDTO for HRM module
     */
    public com.school.hrm.dto.StaffDTO convertCoreStaffToHrmDTO(com.school.core.model.Staff staff) {
        if (staff == null) return null;
        
        com.school.hrm.dto.StaffDTO dto = new com.school.hrm.dto.StaffDTO();
        dto.setId(staff.getId());
        dto.setStaffId(staff.getStaffId());
        dto.setFirstName(staff.getFirstName());        dto.setLastName(staff.getLastName());
        dto.setEmail(staff.getEmail());
        dto.setPhoneNumber(staff.getPhone());
        dto.setDateOfBirth(staff.getDateOfBirth());
        dto.setAddress(staff.getAddress());
        dto.setJoinDate(staff.getJoiningDate());
        dto.setIsActive(staff.isActive());
        // department is not in StaffDTO
        dto.setRole(staff.getStaffRole() != null ? staff.getStaffRole().getRoleName() : null);
        
        // Convert additional fields as needed
        
        return dto;
    }

    /**
     * Converts a list of Core Staff models to a list of HRM StaffDTOs
     * 
     * @param staffList List of Core Staff entities
     * @return List of StaffDTOs for HRM module
     */
    public List<com.school.hrm.dto.StaffDTO> convertCoreStaffListToHrmDTOList(List<com.school.core.model.Staff> staffList) {
        if (staffList == null) return new ArrayList<>();
        
        return staffList.stream()
            .map(this::convertCoreStaffToHrmDTO)
            .collect(Collectors.toList());
    }
}
