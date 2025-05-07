package com.example.schoolms.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.schoolms.model.Staff;
import com.example.schoolms.model.TeacherDetails;
import com.example.schoolms.repository.StaffRepository;
import com.example.schoolms.repository.TeacherDetailsRepository;
import com.example.schoolms.dto.BulkUploadResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StaffServiceImpl implements StaffService {

    private static final Logger logger = LoggerFactory.getLogger(StaffServiceImpl.class);

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private TeacherDetailsRepository teacherDetailsRepository;

    // Get all staff
    @Override
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    // Get staff by ID
    @Override
    public Optional<Staff> getStaffById(Long id) {
        return staffRepository.findById(id);
    }

    // Find by staff ID
    public Optional<Staff> findByStaffId(String staffId) {
        return staffRepository.findByStaffId(staffId);
    }

    // Find by email
    public Optional<Staff> findByEmail(String email) {
        return staffRepository.findByEmail(email);
    }

    // Find by role
    @Override
    public List<Staff> findByRole(String role) {
        return staffRepository.findByRole(role);
    }

    // Find by active status
    @Override
    public List<Staff> findByIsActive(boolean isActive) {
        return staffRepository.findByIsActive(isActive);
    }

    // Create new staff
    @Override
    public Staff createStaff(Staff staff) {
        // Generate and set a unique staff ID if not provided
        if (staff.getStaffId() == null || staff.getStaffId().isEmpty()) {
            String prefix = getRolePrefix(staff.getRole());
            String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            staff.setStaffId(prefix + "-" + uuid);
        }

        // Save teacher details if the staff is a teacher
        if ("TEACHER".equals(staff.getRole()) && staff.getTeacherDetails() != null) {
            TeacherDetails savedTeacherDetails = teacherDetailsRepository.save(staff.getTeacherDetails());
            staff.setTeacherDetails(savedTeacherDetails);
        }

        return staffRepository.save(staff);
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
            }
        }

        return new BulkUploadResponse(created, updated, errors);
    }

    // Update existing staff with new data
    private void updateExistingStaff(Staff existingStaff, Staff newStaff) {
        // Update basic info
        if (newStaff.getFirstName() != null)
            existingStaff.setFirstName(newStaff.getFirstName());
        if (newStaff.getLastName() != null)
            existingStaff.setLastName(newStaff.getLastName());
        if (newStaff.getEmail() != null)
            existingStaff.setEmail(newStaff.getEmail());
        if (newStaff.getPhoneNumber() != null)
            existingStaff.setPhoneNumber(newStaff.getPhoneNumber());
        if (newStaff.getAddress() != null)
            existingStaff.setAddress(newStaff.getAddress());
        if (newStaff.getDateOfBirth() != null)
            existingStaff.setDateOfBirth(newStaff.getDateOfBirth());
        if (newStaff.getGender() != null)
            existingStaff.setGender(newStaff.getGender());
        if (newStaff.getNin() != null)
            existingStaff.setNin(newStaff.getNin());

        // Only update role if provided (this might require special handling)
        if (newStaff.getRole() != null && !newStaff.getRole().equals(existingStaff.getRole())) {
            existingStaff.setRole(newStaff.getRole());

            // Handle teacher details if role is changed to or from TEACHER
            if ("TEACHER".equals(newStaff.getRole())) {
                // If changing to TEACHER role and teacher details are provided
                if (newStaff.getTeacherDetails() != null) {
                    // If existing staff already has teacher details, update them
                    if (existingStaff.getTeacherDetails() != null) {
                        TeacherDetails existingDetails = existingStaff.getTeacherDetails();
                        if (newStaff.getTeacherDetails().getDepartment() != null) {
                            existingDetails.setDepartment(newStaff.getTeacherDetails().getDepartment());
                        }
                        if (newStaff.getTeacherDetails().getSubjects() != null) {
                            existingDetails.setSubjects(newStaff.getTeacherDetails().getSubjects());
                        }
                        teacherDetailsRepository.save(existingDetails);
                    } else {
                        // Create new teacher details
                        TeacherDetails savedDetails = teacherDetailsRepository.save(newStaff.getTeacherDetails());
                        existingStaff.setTeacherDetails(savedDetails);
                    }
                }
            } else {
                // If changing from TEACHER role, remove teacher details
                existingStaff.setTeacherDetails(null);
            }
        } else if ("TEACHER".equals(existingStaff.getRole()) && newStaff.getTeacherDetails() != null) {
            // Update teacher details if role is still TEACHER and details are provided
            if (existingStaff.getTeacherDetails() != null) {
                TeacherDetails existingDetails = existingStaff.getTeacherDetails();
                if (newStaff.getTeacherDetails().getDepartment() != null) {
                    existingDetails.setDepartment(newStaff.getTeacherDetails().getDepartment());
                }
                if (newStaff.getTeacherDetails().getSubjects() != null) {
                    existingDetails.setSubjects(newStaff.getTeacherDetails().getSubjects());
                }
                teacherDetailsRepository.save(existingDetails);
            } else {
                // Create new teacher details
                TeacherDetails savedDetails = teacherDetailsRepository.save(newStaff.getTeacherDetails());
                existingStaff.setTeacherDetails(savedDetails);
            }
        }
    }

    // Update staff
    @Override
    public Optional<Staff> updateStaff(Long id, Staff staffDetails) {
        Optional<Staff> staffOptional = staffRepository.findById(id);
        if (staffOptional.isPresent()) {
            Staff staff = staffOptional.get();
            updateExistingStaff(staff, staffDetails);
            return Optional.of(staffRepository.save(staff));
        }
        return Optional.empty();
    }

    // Delete staff
    @Override
    public boolean deleteStaff(Long id) {
        Optional<Staff> staffOptional = staffRepository.findById(id);
        if (staffOptional.isPresent()) {
            staffRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Generate role-specific prefix for staff ID
    private String getRolePrefix(String role) {
        if (role == null)
            return "STAF";

        switch (role) {
            case "TEACHER":
                return "TCHR";
            case "PRINCIPAL":
                return "PRIN";
            case "ADMIN_OFFICER":
                return "ADMN";
            case "MANAGEMENT":
                return "MGMT";
            case "ACCOUNT_OFFICER":
                return "ACCT";
            case "LIBRARIAN":
                return "LIBR";
            default:
                return "STAF";
        }
    }
}