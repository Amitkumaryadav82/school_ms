package com.example.schoolms.service;

import com.example.schoolms.dto.BulkUploadResponse;
import com.example.schoolms.model.Staff;

import java.util.List;
import java.util.Optional;

public interface StaffService {
    List<Staff> getAllStaff();

    Optional<Staff> getStaffById(Long id);

    Staff createStaff(Staff staff);

    Optional<Staff> updateStaff(Long id, Staff staffDetails);

    boolean deleteStaff(Long id);

    List<Staff> findByRole(String role);

    List<Staff> findByIsActive(boolean active);

    BulkUploadResponse bulkCreateOrUpdateStaff(List<Staff> staffList);
}