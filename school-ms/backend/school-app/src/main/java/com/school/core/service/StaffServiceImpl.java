package com.school.core.service;

import com.school.common.dto.BulkUploadResponse;
import com.school.core.model.Staff;
import com.school.core.repository.StaffRepository;
import com.school.staff.dto.BulkStaffRequest;
import com.school.core.adapter.EntityAdapter;

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
 * Consolidated implementation that replaces multiple legacy services.
 */
@Service("coreStaffServiceImpl")
public class StaffServiceImpl implements StaffService {

    private static final Logger logger = LoggerFactory.getLogger(StaffServiceImpl.class);

    private final StaffRepository staffRepository;
    
    @Autowired
    private EntityAdapter entityAdapter;

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
    public Optional<Staff> getStaffByStaffId(String staffId) {
        return staffRepository.findByStaffId(staffId);
    }
    
    @Override
    public Optional<Staff> getStaffByEmail(String email) {
        return staffRepository.findByEmail(email);
    }

    @Override
    @Transactional
    public Staff createStaff(Staff staff) {
        logger.info("Creating new staff member: {}", staff.getEmail());
        
        // Validate required fields
        validateStaffFields(staff);
        
        // Check if staff with same email already exists
        if (staff.getEmail() != null && !staff.getEmail().isEmpty()) {
            Optional<Staff> existingStaff = staffRepository.findByEmail(staff.getEmail());
            if (existingStaff.isPresent()) {
                throw new IllegalArgumentException("Staff with email " + staff.getEmail() + " already exists");
            }
        }
        
        // Check if staff with same staffId already exists
        if (staff.getStaffId() != null && !staff.getStaffId().isEmpty()) {
            Optional<Staff> existingStaff = staffRepository.findByStaffId(staff.getStaffId());
            if (existingStaff.isPresent()) {
                throw new IllegalArgumentException("Staff with ID " + staff.getStaffId() + " already exists");
            }
        }
        
        return staffRepository.save(staff);
    }
    
    @Override
    public Staff saveStaff(Staff staff) {
        return staffRepository.save(staff);
    }

    @Override
    @Transactional
    public Optional<Staff> updateStaff(Staff staff) {
        if (staff.getId() == null) {
            throw new IllegalArgumentException("Staff ID cannot be null for update operation");
        }
        return updateStaff(staff.getId(), staff);
    }

    @Override
    @Transactional
    public Optional<Staff> updateStaff(Long id, Staff staffDetails) {
        logger.info("Updating staff with ID: {}", id);
        
        return staffRepository.findById(id)
                .map(existingStaff -> {
                    // Update non-null fields from staffDetails to existingStaff
                    if (staffDetails.getStaffId() != null) {
                        existingStaff.setStaffId(staffDetails.getStaffId());
                    }
                    if (staffDetails.getFirstName() != null) {
                        existingStaff.setFirstName(staffDetails.getFirstName());
                    }
                    if (staffDetails.getMiddleName() != null) {
                        existingStaff.setMiddleName(staffDetails.getMiddleName());
                    }
                    if (staffDetails.getLastName() != null) {
                        existingStaff.setLastName(staffDetails.getLastName());
                    }
                    if (staffDetails.getEmail() != null) {
                        existingStaff.setEmail(staffDetails.getEmail());
                    }
                    if (staffDetails.getPhone() != null) {
                        existingStaff.setPhone(staffDetails.getPhone());
                    }
                    if (staffDetails.getDateOfBirth() != null) {
                        existingStaff.setDateOfBirth(staffDetails.getDateOfBirth());
                    }
                    if (staffDetails.getAddress() != null) {
                        existingStaff.setAddress(staffDetails.getAddress());
                    }
                    if (staffDetails.getRole() != null) {
                        existingStaff.setRole(staffDetails.getRole());
                    }
                    if (staffDetails.getEmploymentStatus() != null) {
                        existingStaff.setEmploymentStatus(staffDetails.getEmploymentStatus());
                    }                    // Use isActive instead of getActive (boolean vs Boolean)
                    existingStaff.setActive(staffDetails.isActive());

                    if (staffDetails.getJoiningDate() != null) {
                        existingStaff.setJoiningDate(staffDetails.getJoiningDate());
                    }
                    if (staffDetails.getTeacherDetails() != null) {
                        existingStaff.setTeacherDetails(staffDetails.getTeacherDetails());
                    }

                    return staffRepository.save(existingStaff);
                });
    }

    @Override
    public boolean deleteStaff(Long id) {
        logger.info("Deleting staff with ID: {}", id);
        
        return staffRepository.findById(id)
                .map(staff -> {
                    staffRepository.delete(staff);
                    return true;
                })
                .orElse(false);
    }

    @Override
    public List<Staff> findByRole(String role) {
        return staffRepository.findByRoleName(role);
    }
    
    @Override
    public List<Staff> findByIsActive(boolean active) {
        return staffRepository.findByIsActive(active);
    }
    
    @Override
    public List<Staff> findAllTeachers() {
        return staffRepository.findAllTeachers();
    }    @Override
    @Transactional
    public BulkUploadResponse bulkUploadStaff(BulkStaffRequest request) {
        logger.info("Processing bulk staff upload with {} records", request.getStaff().size());        // Convert staff.model.Staff to core.model.Staff
        List<Staff> coreStaffList = new ArrayList<>();
        for (com.school.staff.model.Staff staffModuleStaff : request.getStaff()) {
            Staff coreStaff = entityAdapter.convertStaffModelToCore(staffModuleStaff);
            coreStaffList.add(coreStaff);
        }
        
        return bulkCreateOrUpdateStaff(coreStaffList);
    }
    
    @Override
    @Transactional
    public BulkUploadResponse bulkUploadStaffList(List<Staff> staffList) {
        logger.info("Processing bulk staff upload list with {} records", staffList.size());
        return bulkCreateOrUpdateStaff(staffList);
    }

    @Override
    @Transactional
    public BulkUploadResponse bulkCreateOrUpdateStaff(List<Staff> staffList) {
        int created = 0;
        int updated = 0;
        List<String> errors = new ArrayList<>();

        for (Staff staff : staffList) {
            try {
                // If staff has ID, try to update
                if (staff.getId() != null) {
                    Optional<Staff> existingStaff = staffRepository.findById(staff.getId());
                    if (existingStaff.isPresent()) {
                        updateStaff(staff.getId(), staff);
                        updated++;
                    } else {
                        createStaff(staff);
                        created++;
                    }
                } 
                // If staff has staffId, try to find by staffId and update
                else if (staff.getStaffId() != null && !staff.getStaffId().isEmpty()) {
                    Optional<Staff> existingStaff = staffRepository.findByStaffId(staff.getStaffId());
                    if (existingStaff.isPresent()) {
                        updateStaff(existingStaff.get().getId(), staff);
                        updated++;
                    } else {
                        createStaff(staff);
                        created++;
                    }
                }
                // If staff has email, try to find by email and update 
                else if (staff.getEmail() != null && !staff.getEmail().isEmpty()) {
                    Optional<Staff> existingStaff = staffRepository.findByEmail(staff.getEmail());
                    if (existingStaff.isPresent()) {
                        updateStaff(existingStaff.get().getId(), staff);
                        updated++;
                    } else {
                        createStaff(staff);
                        created++;
                    }
                } 
                // Otherwise, create new staff
                else {
                    createStaff(staff);
                    created++;
                }
            } catch (Exception e) {
                String errorMsg = "Error processing staff: " + (staff.getEmail() != null ? staff.getEmail() : "unknown")
                        + " - " + e.getMessage();
                logger.error(errorMsg, e);
                errors.add(errorMsg);
            }
        }        // Using the fields directly rather than setters based on the BulkUploadResponse class
        BulkUploadResponse response = new BulkUploadResponse();
        response.setCreated(created);
        response.setUpdated(updated);
        response.setErrors(errors);
        
        String message = String.format("Processed %d records: %d created, %d updated, %d errors",
                staffList.size(), created, updated, errors.size());

        return response;
    }
    
    /**
     * Validate required staff fields
     */
    private void validateStaffFields(Staff staff) {
        List<String> errors = new ArrayList<>();
        
        if (staff.getFirstName() == null || staff.getFirstName().trim().isEmpty()) {
            errors.add("First name is required");
        }
        
        if (staff.getLastName() == null || staff.getLastName().trim().isEmpty()) {
            errors.add("Last name is required");
        }
        
        if (staff.getEmail() == null || staff.getEmail().trim().isEmpty()) {
            errors.add("Email is required");
        }
        
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException("Staff validation errors: " + String.join(", ", errors));
        }
    }
}
