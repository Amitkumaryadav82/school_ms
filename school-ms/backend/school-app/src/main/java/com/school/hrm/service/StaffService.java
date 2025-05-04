package com.school.hrm.service;

import java.util.List;

import com.school.hrm.dto.StaffDTO;

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
}