package com.school.hrm.service;

import com.school.hrm.dto.StaffDTO;
import com.school.hrm.entity.Staff;
import com.school.hrm.model.EmploymentStatus;

import java.util.List;

/**
 * @deprecated This service is being phased out in favor of the consolidated StaffService in the core package.
 * This interface is kept for backward compatibility during the migration process.
 */
@Deprecated
public interface StaffService {
    
    List<StaffDTO> getAllStaff();
    
    Staff getStaffById(Long id);
    
    StaffDTO getStaffDtoById(Long id);
    
    StaffDTO createStaff(StaffDTO staffDTO);
    
    StaffDTO updateStaff(Long id, StaffDTO staffDTO);
    
    void deleteStaff(Long id);
    
    List<StaffDTO> getStaffByRole(String roleName);
    
    List<StaffDTO> getStaffByEmploymentStatus(EmploymentStatus status);
    
    List<StaffDTO> searchStaffByName(String name);
    
    StaffDTO getStaffByEmail(String email);
    
    StaffDTO getStaffByPhone(String phone);
    
    List<StaffDTO> getStaffByDepartment(String department);
    
    List<StaffDTO> getStaffByDesignation(String designation);
}
