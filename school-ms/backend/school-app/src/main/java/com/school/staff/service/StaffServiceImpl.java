package com.school.staff.service;

import com.school.common.dto.BulkUploadResponse;
import com.school.staff.model.Staff;
import com.school.staff.adapter.StaffAdapter;
import com.school.staff.adapter.StaffEntityAdapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Main implementation of StaffService interface.
 * Uses qualifier "schoolStaffServiceImpl" for dependency injection following the standardized convention.
 * This is a consolidated version migrated from com.example.schoolms.service.StaffServiceImpl
 * 
 * @deprecated This implementation is deprecated in favor of com.school.core.service.StaffServiceImpl.
 * It now acts as an adapter to the new implementation using the StaffEntityAdapter to convert between entity types.
 * See PACKAGE-MIGRATION-PLAN.md for more details.
 */
@Service("schoolStaffServiceImpl")
@Deprecated
public class StaffServiceImpl implements StaffService {    private static final Logger logger = LoggerFactory.getLogger(StaffServiceImpl.class);
    
    @Autowired
    private StaffEntityAdapter staffEntityAdapter;
      @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("coreStaffServiceImpl")
    private com.school.core.service.StaffService coreStaffService;

    private final StaffAdapter staffAdapter;
    
    @Autowired
    public StaffServiceImpl(StaffAdapter staffAdapter) {
        this.staffAdapter = staffAdapter;
    }    @Override
    public List<Staff> getAllStaff() {
        List<com.school.core.dto.StaffDTO> dtoList = staffAdapter.getAllStaffLegacy();
        return convertDTOListToStaffList(dtoList);
    }
    
    @Override
    public Optional<Staff> getStaffById(Long id) {
        com.school.core.dto.StaffDTO dto = staffAdapter.getStaffByIdLegacy(id);
        if (dto == null) {
            return Optional.empty();
        }
        return Optional.of(convertDTOToStaff(dto));
    }    @Override
    public Staff createStaff(Staff staff) {
        // Generate staff ID if not provided
        if (staff.getStaffId() == null || staff.getStaffId().isEmpty()) {
            String rolePrefix = getRolePrefix(staff.getRole());
            String randomSuffix = String.format("%04d", (int) (Math.random() * 10000));
            staff.setStaffId(rolePrefix + randomSuffix);
        }
        
        // Set joining date to current date if not provided
        if (staff.getJoiningDate() == null) {
            staff.setJoiningDate(LocalDate.now());
        }
        
        com.school.core.dto.StaffDTO dto = staffAdapter.createStaffLegacy(staff);
        return convertDTOToStaff(dto);
    }    @Override
    public Optional<Staff> updateStaff(Long id, Staff staffDetails) {
        com.school.core.dto.StaffDTO dto = staffAdapter.updateStaffLegacy(id, staffDetails);
        if (dto == null) {
            return Optional.empty();
        }
        return Optional.of(convertDTOToStaff(dto));
    }
    
    @Override
    public boolean deleteStaff(Long id) {
        staffAdapter.deleteStaffLegacy(id);
        return true;
    }
    
    @Override
    public List<Staff> findByRole(String role) {
        List<com.school.core.dto.StaffDTO> dtoList = staffAdapter.findByRoleLegacy(role);
        return convertDTOListToStaffList(dtoList);
    }

    @Override
    public List<Staff> findByIsActive(boolean active) {
        List<com.school.core.dto.StaffDTO> dtoList = staffAdapter.findByIsActiveLegacy(active);
        return convertDTOListToStaffList(dtoList);
    }    @Override
    @Transactional
    public BulkUploadResponse bulkCreateOrUpdateStaff(List<Staff> staffList) {
        return staffAdapter.bulkCreateOrUpdateStaffLegacy(staffList);
    }
    
    /**
     * Convert a StaffDTO to a legacy Staff model
     * @param dto StaffDTO from core package
     * @return Legacy Staff entity
     */
    private Staff convertDTOToStaff(com.school.core.dto.StaffDTO dto) {
        if (dto == null) return null;
        
        Staff staff = new Staff();
        staff.setId(dto.getId());
        staff.setStaffId(dto.getStaffId());
        staff.setFirstName(dto.getFirstName());
        staff.setLastName(dto.getLastName());
        staff.setEmail(dto.getEmail());
        staff.setPhone(dto.getPhone());
        
        // Convert other fields as needed
        if (dto.getDesignation() != null) {
            staff.setDesignation(dto.getDesignation());
        }
        
        if (dto.getDepartment() != null) {
            staff.setDepartment(dto.getDepartment());
        }
        
        if (dto.getDateOfJoining() != null) {
            staff.setJoiningDate(dto.getDateOfJoining());
        }
        
        // Convert role information
        if (dto.getStaffRole() != null) {
            staff.setRole(dto.getStaffRole().getName());
        }
        
        return staff;
    }
    
    /**
     * Convert a list of StaffDTOs to a list of legacy Staff entities
     * @param dtoList List of StaffDTOs
     * @return List of legacy Staff entities
     */
    private List<Staff> convertDTOListToStaffList(List<com.school.core.dto.StaffDTO> dtoList) {
        List<Staff> staffList = new ArrayList<>();
        if (dtoList == null) return staffList;
        
        for (com.school.core.dto.StaffDTO dto : dtoList) {
            Staff staff = convertDTOToStaff(dto);
            if (staff != null) {
                staffList.add(staff);
            }
        }
        
        return staffList;
    }

    /**
     * Get role prefix for staff ID generation
     * @param role The staff role
     * @return Two-letter prefix for the role
     */
    private String getRolePrefix(String role) {
        if (role == null) {
            return "ST";
        }
        
        String normalizedRole = role.toUpperCase();
        
        if (normalizedRole.contains("TEACHER") || normalizedRole.contains("FACULTY")) {
            return "TC";
        } else if (normalizedRole.contains("ADMIN")) {
            return "AD";
        } else if (normalizedRole.contains("PRINCIPAL")) {
            return "PR";
        } else if (normalizedRole.contains("LIBRARIAN")) {
            return "LB";
        } else if (normalizedRole.contains("ACCOUNTANT")) {
            return "AC";
        } else {
            return "ST"; // Default for staff
        }
    }
}
