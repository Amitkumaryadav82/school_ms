package com.school.hrm.service;

import java.util.List;

import com.school.hrm.dto.StaffDTO;
import com.school.hrm.model.EmploymentStatus;

public interface StaffService {

    List<StaffDTO> getAllStaff();

    StaffDTO getStaffById(Long id);

    StaffDTO getStaffByStaffId(String staffId);

    StaffDTO getStaffByEmail(String email);

    List<StaffDTO> getStaffByRole(String roleName);

    List<StaffDTO> getActiveStaff();

    List<StaffDTO> getAllTeachers();

    List<StaffDTO> getAllPrincipals();

    List<StaffDTO> getAllAdminOfficers();

    List<StaffDTO> getAllManagementStaff();

    List<StaffDTO> getAllAccountOfficers();

    List<StaffDTO> getAllLibrarians();

    StaffDTO createStaff(StaffDTO staffDTO);

    StaffDTO updateStaff(Long id, StaffDTO staffDTO);

    void deleteStaff(Long id);

    void deactivateStaff(Long id);

    void activateStaff(Long id);

    // Methods for handling staff with special designations
    List<StaffDTO> getStaffByDesignation(String designationName);

    List<StaffDTO> getTeachersByDesignation(String designationName);

    StaffDTO assignDesignationToStaff(Long staffId, Long designationId);

    void removeDesignationFromStaff(Long staffId, Long designationId);

    /**
     * Updates the employment status of a staff member
     *
     * @param id     The ID of the staff member
     * @param status The new employment status
     * @return The updated staff member information
     */
    StaffDTO updateStaffStatus(Long id, EmploymentStatus status);
}