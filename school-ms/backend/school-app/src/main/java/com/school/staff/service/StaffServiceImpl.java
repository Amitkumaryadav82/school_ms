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
    }
      @Override
    public List<Staff> getAllStaff() {
        return staffAdapter.getAllStaffLegacy();
    }
    
    @Override
    public Optional<Staff> getStaffById(Long id) {
        return staffAdapter.getStaffByIdLegacy(id);
    }

    @Override
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
        
        return staffAdapter.createStaffLegacy(staff);
    }    @Override
    public Optional<Staff> updateStaff(Long id, Staff staffDetails) {
        return staffAdapter.updateStaffLegacy(id, staffDetails);
    }
    
    @Override
    public boolean deleteStaff(Long id) {
        return staffAdapter.deleteStaffLegacy(id);
    }
    
    @Override
    public List<Staff> findByRole(String role) {
        return staffAdapter.findByRoleLegacy(role);
    }

    @Override
    public List<Staff> findByIsActive(boolean active) {
        return staffAdapter.findByIsActiveLegacy(active);
    }

    @Override
    @Transactional
    public BulkUploadResponse bulkCreateOrUpdateStaff(List<Staff> staffList) {
        return staffAdapter.bulkCreateOrUpdateStaffLegacy(staffList);
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
