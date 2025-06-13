package com.example.schoolms.service.impl;

import com.example.schoolms.dto.BulkUploadResponse;
import com.example.schoolms.model.Staff;
import com.example.schoolms.repository.StaffRepository;
import com.example.schoolms.service.StaffService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service("exampleSchoolmsStaffServiceImpl") // Added a unique bean name here
public class StaffServiceImpl implements StaffService {

    private static final Logger logger = LoggerFactory.getLogger(StaffServiceImpl.class);

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

        // Ensure phone and phoneNumber are consistent
        if (staff.getPhone() == null && staff.getPhoneNumber() != null) {
            staff.setPhone(staff.getPhoneNumber());
        } else if (staff.getPhoneNumber() == null && staff.getPhone() != null) {
            staff.setPhoneNumber(staff.getPhone());
        }

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

    // Bulk create or update staff
    @Override
    @Transactional
    public BulkUploadResponse bulkCreateOrUpdateStaff(List<Staff> staffList) {
        int created = 0;
        int updated = 0;
        List<String> errors = new ArrayList<>();

        for (Staff staff : staffList) {
            try {
                // Check if staff already exists by staffId or email
                Optional<Staff> existingStaffByStaffId = Optional.empty();
                if (staff.getStaffId() != null && !staff.getStaffId().isEmpty()) {
                    existingStaffByStaffId = staffRepository.findByStaffId(staff.getStaffId());
                }

                Optional<Staff> existingStaffByEmail = Optional.empty();
                if (staff.getEmail() != null && !staff.getEmail().isEmpty()) {
                    existingStaffByEmail = staffRepository.findByEmail(staff.getEmail());
                }

                // If staff exists (by staffId or email), update
                if (existingStaffByStaffId.isPresent()) {
                    Staff existingStaff = existingStaffByStaffId.get();
                    updateExistingStaff(existingStaff, staff);
                    staffRepository.save(existingStaff);
                    updated++;
                } else if (existingStaffByEmail.isPresent()) {
                    Staff existingStaff = existingStaffByEmail.get();
                    updateExistingStaff(existingStaff, staff);
                    staffRepository.save(existingStaff);
                    updated++;
                } else {
                    // Create new staff
                    createStaff(staff);
                    created++;
                }
            } catch (Exception e) {
                String errorMsg = "Error processing staff: " + (staff.getEmail() != null ? staff.getEmail() : "unknown")
                        + " - " + e.getMessage();
                logger.error(errorMsg, e);
                errors.add(errorMsg);
            }        }        BulkUploadResponse response = new BulkUploadResponse(created, updated);
        response.setErrors(errors);
        return response;
    }

    // Update existing staff with new data
    private void updateExistingStaff(Staff existingStaff, Staff newStaff) {
        // Update only non-null fields to preserve existing data
        if (newStaff.getFirstName() != null) {
            existingStaff.setFirstName(newStaff.getFirstName());
        }
        if (newStaff.getLastName() != null) {
            existingStaff.setLastName(newStaff.getLastName());
        }
        if (newStaff.getPhone() != null) {
            existingStaff.setPhone(newStaff.getPhone());
            // Keep both phone fields in sync
            existingStaff.setPhoneNumber(newStaff.getPhone());
        }
        if (newStaff.getPhoneNumber() != null) {
            existingStaff.setPhoneNumber(newStaff.getPhoneNumber());
            // Keep both phone fields in sync
            existingStaff.setPhone(newStaff.getPhoneNumber());
        }
        if (newStaff.getEmail() != null) {
            existingStaff.setEmail(newStaff.getEmail());
        }
        if (newStaff.getRole() != null) {
            existingStaff.setRole(newStaff.getRole());
        }
        if (newStaff.getAddress() != null) {
            existingStaff.setAddress(newStaff.getAddress());
        }
        if (newStaff.getDateOfBirth() != null) {
            existingStaff.setDateOfBirth(newStaff.getDateOfBirth());
        }
        if (newStaff.getJoiningDate() != null) {
            existingStaff.setJoiningDate(newStaff.getJoiningDate());
        }
        if (newStaff.getDepartment() != null) {
            existingStaff.setDepartment(newStaff.getDepartment());
        }
    }    // Generate role-specific prefix for staff ID
    private String getRolePrefix(String role) {
        if (role == null) {
            return "STF";
        }

        String upperRole = role.toUpperCase();
        switch (upperRole) {
            case "TEACHER":
                return "TCH";
            case "PRINCIPAL":
                return "PRI";
            case "ADMIN":
                return "ADM";
            case "ADMIN OFFICER":
            case "ADMINISTRATION":
                return "ADO";
            case "LIBRARIAN":
                return "LIB";
            case "ACCOUNTANT":
            case "ACCOUNT OFFICER":
                return "ACC";
            default:
                return "STF";
        }
    }
}