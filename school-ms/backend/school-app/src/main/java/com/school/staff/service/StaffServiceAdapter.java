package com.school.staff.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.example.schoolms.dto.BulkUploadResponse;
import com.example.schoolms.model.Staff;
import com.example.schoolms.service.StaffService;

/**
 * Adapter class to bridge the gap between the new controller structure
 * and the existing StaffService implementation
 */
@Service
public class StaffServiceAdapter {

    private final StaffService staffService;

    @Autowired
    public StaffServiceAdapter(@Qualifier("exampleSchoolmsStaffServiceImpl") StaffService staffService) {
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
    }

    public BulkUploadResponse bulkCreateOrUpdateStaff(List<Staff> staffList) {
        return staffService.bulkCreateOrUpdateStaff(staffList);
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