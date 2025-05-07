package com.example.schoolms.service.impl;

import com.example.schoolms.dto.BulkUploadResponse;
import com.example.schoolms.model.Staff;
import com.example.schoolms.repository.StaffRepository;
import com.example.schoolms.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;

    @Autowired
    public StaffServiceImpl(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    @Override
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    @Override
    public Optional<Staff> getStaffById(Long id) {
        return staffRepository.findById(id);
    }

    @Override
    public Staff createStaff(Staff staff) {
        return staffRepository.save(staff);
    }

    @Override
    public Optional<Staff> updateStaff(Long id, Staff staffDetails) {
        return staffRepository.findById(id).map(staff -> {
            staff.setFirstName(staffDetails.getFirstName());
            staff.setLastName(staffDetails.getLastName());
            staff.setEmail(staffDetails.getEmail());
            staff.setPhone(staffDetails.getPhone());
            staff.setRole(staffDetails.getRole());
            staff.setActive(staffDetails.isActive());
            staff.setDepartment(staffDetails.getDepartment());
            staff.setAddress(staffDetails.getAddress());
            staff.setJoiningDate(staffDetails.getJoiningDate());
            return staffRepository.save(staff);
        });
    }

    @Override
    public boolean deleteStaff(Long id) {
        return staffRepository.findById(id).map(staff -> {
            staffRepository.delete(staff);
            return true;
        }).orElse(false);
    }

    @Override
    public List<Staff> findByRole(String role) {
        return staffRepository.findByRole(role);
    }

    @Override
    public List<Staff> findByIsActive(boolean active) {
        return staffRepository.findByIsActive(active);
    }

    @Override
    public BulkUploadResponse bulkCreateOrUpdateStaff(List<Staff> staffList) {
        List<Staff> createdStaff = new ArrayList<>();
        List<Staff> updatedStaff = new ArrayList<>();
        List<Staff> failedStaff = new ArrayList<>();

        for (Staff staff : staffList) {
            try {
                // Check if staff with this email already exists
                Optional<Staff> existingStaff = staffRepository.findByEmail(staff.getEmail());

                if (existingStaff.isPresent()) {
                    // Update existing staff
                    Staff updated = updateExistingStaff(existingStaff.get(), staff);
                    updatedStaff.add(updated);
                } else {
                    // Create new staff
                    Staff created = staffRepository.save(staff);
                    createdStaff.add(created);
                }
            } catch (Exception e) {
                failedStaff.add(staff);
            }
        }

        return new BulkUploadResponse(createdStaff, updatedStaff, failedStaff);
    }

    private Staff updateExistingStaff(Staff existing, Staff updated) {
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setPhone(updated.getPhone());
        existing.setRole(updated.getRole());
        existing.setActive(updated.isActive());
        existing.setDepartment(updated.getDepartment());
        existing.setAddress(updated.getAddress());
        existing.setJoiningDate(updated.getJoiningDate());
        return staffRepository.save(existing);
    }
}