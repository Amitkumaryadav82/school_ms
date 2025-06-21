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
import com.school.core.model.StaffRole;
import com.school.core.model.EmploymentStatus;
import com.school.core.dto.StaffDTO;

/**
 * Adapter class to facilitate migration from legacy Staff entities to the consolidated Staff entity.
 * This class provides methods to convert between legacy Staff entities and the new consolidated Staff entity.
 */
@Component
public class StaffEntityAdapter {
    @Autowired
    private StaffRepository staffRepository;

    /**
     * Convert consolidated Staff entity to core Staff DTO
     * 
     * @param staff Consolidated Staff entity
     * @return Core Staff DTO
     */    
    public StaffDTO convertToDTO(Staff staff) {
        if (staff == null) return null;
        
        StaffDTO dto = new StaffDTO();
        
        dto.setId(staff.getId());
        dto.setStaffId(staff.getStaffId());
        dto.setFirstName(staff.getFirstName());
        dto.setLastName(staff.getLastName());
        dto.setEmail(staff.getEmail());
        dto.setPhone(staff.getPhone());
        dto.setDesignation(staff.getDesignation());
        dto.setDepartment(staff.getDepartment());
        dto.setEmploymentStatus(staff.getEmploymentStatus());
        
        return dto;
    }
    
    /**
     * Convert from legacy Staff entity to consolidated Staff entity
     * 
     * @param legacyStaff Staff from com.school.staff.model.Staff
     * @return Consolidated Staff entity
     */
    public Staff fromLegacyStaff(com.school.staff.model.Staff legacyStaff) {
        if (legacyStaff == null) {
            return null;
        }
        
        Staff staff = new Staff();
        
        // Map basic properties
        staff.setStaffId(legacyStaff.getStaffId());
        staff.setFirstName(legacyStaff.getFirstName());
        staff.setLastName(legacyStaff.getLastName());
        staff.setEmail(legacyStaff.getEmail());
        staff.setPhone(legacyStaff.getPhone());
        
        // Map additional properties if they exist
        if (legacyStaff.getAddress() != null) {
            staff.setAddress(legacyStaff.getAddress());
        }
        
        if (legacyStaff.getDepartment() != null) {
            staff.setDepartment(legacyStaff.getDepartment());
        }
        
        return staff;
    }
    
    /**
     * Update an existing Staff entity with data from legacy Staff
     * 
     * @param staff Existing consolidated Staff entity
     * @param legacyStaff Legacy Staff entity
     * @return Updated consolidated Staff entity
     */
    public Staff updateFromLegacyStaff(Staff staff, com.school.staff.model.Staff legacyStaff) {
        if (staff == null || legacyStaff == null) {
            return staff;
        }
        
        // Only update fields that are not null in legacyStaff
        if (legacyStaff.getFirstName() != null) {
            staff.setFirstName(legacyStaff.getFirstName());
        }
        
        if (legacyStaff.getLastName() != null) {
            staff.setLastName(legacyStaff.getLastName());
        }
        
        if (legacyStaff.getEmail() != null) {
            staff.setEmail(legacyStaff.getEmail());
        }
        
        if (legacyStaff.getPhone() != null) {
            staff.setPhone(legacyStaff.getPhone());
        }
        
        if (legacyStaff.getAddress() != null) {
            staff.setAddress(legacyStaff.getAddress());
        }
        
        if (legacyStaff.getDepartment() != null) {
            staff.setDepartment(legacyStaff.getDepartment());
        }
        
        return staff;
    }
    
    /**
     * Convert a list of Staff entities to a list of Staff DTOs
     * 
     * @param staffList List of Staff entities
     * @return List of Staff DTOs
     */
    public List<StaffDTO> convertToDTOList(List<Staff> staffList) {
        if (staffList == null) return new ArrayList<>();
        
        return staffList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert from DTO to entity
     * 
     * @param dto The Staff DTO
     * @return Staff entity
     */
    public Staff convertToEntity(StaffDTO dto) {
        if (dto == null) return null;
        
        Staff staff = new Staff();
        
        staff.setId(dto.getId());
        staff.setStaffId(dto.getStaffId());
        staff.setFirstName(dto.getFirstName());
        staff.setLastName(dto.getLastName());
        staff.setEmail(dto.getEmail());
        staff.setPhone(dto.getPhone());
        staff.setDesignation(dto.getDesignation());
        staff.setDepartment(dto.getDepartment());
        staff.setEmploymentStatus(dto.getEmploymentStatus());
        staff.setStaffRole(dto.getStaffRole());
        staff.setDateOfJoining(dto.getDateOfJoining());
        staff.setDateOfBirth(dto.getDateOfBirth());
        staff.setGender(dto.getGender());
        
        return staff;
    }
    
    /**
     * Convert a core Staff entity to an HRM Staff DTO
     *
     * @param staff Core Staff entity
     * @return HRM Staff DTO
     */
    public com.school.hrm.dto.StaffDTO convertCoreStaffToHrmDTO(Staff staff) {
        if (staff == null) return null;
        
        com.school.hrm.dto.StaffDTO dto = new com.school.hrm.dto.StaffDTO();
        
        dto.setId(staff.getId());
        dto.setStaffId(staff.getStaffId());
        dto.setFirstName(staff.getFirstName());
        dto.setLastName(staff.getLastName());
        dto.setFullName(staff.getFirstName() + " " + staff.getLastName());
        dto.setEmail(staff.getEmail());
        dto.setPhoneNumber(staff.getPhone());
        dto.setAddress(staff.getAddress());
        dto.setDateOfBirth(staff.getDateOfBirth());
        dto.setGender(staff.getGender());
        dto.setJoinDate(staff.getDateOfJoining());
        dto.setDepartment(staff.getDepartment());
        dto.setDesignation(staff.getDesignation());
        
        if (staff.getRole() != null) {
            dto.setRoleId(staff.getRole().getId());
            dto.setRoleName(staff.getRole().getName());
            dto.setRole(staff.getRole().getName());
        }
        
        dto.setIsActive(staff.isActive());
        
        // Convert employment status
        if (staff.getEmploymentStatus() != null) {
            dto.setEmploymentStatus(staff.getEmploymentStatus().name());
        }
        
        return dto;
    }

    /**
     * Convert a list of core Staff entities to a list of HRM Staff DTOs
     *
     * @param staffList List of core Staff entities
     * @return List of HRM Staff DTOs
     */
    public List<com.school.hrm.dto.StaffDTO> convertCoreStaffListToHrmDTOList(List<Staff> staffList) {
        if (staffList == null) return new ArrayList<>();
        
        return staffList.stream()
            .map(this::convertCoreStaffToHrmDTO)
            .collect(Collectors.toList());
    }
}
