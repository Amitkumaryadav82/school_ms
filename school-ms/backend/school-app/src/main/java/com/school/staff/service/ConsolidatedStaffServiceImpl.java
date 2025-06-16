package com.school.staff.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.school.staff.model.ConsolidatedStaff;
import com.school.staff.model.EmploymentStatus;
import com.school.staff.repository.ConsolidatedStaffRepository;

/**
 * Consolidated Staff service implementation that combines functionality 
 * from both previous implementations.
 * This combines features from:
 * - com.school.hrm.service.StaffServiceImpl
 * - Any other staff service implementations in the system
 */
@Service
public class ConsolidatedStaffServiceImpl implements ConsolidatedStaffService {

    private final ConsolidatedStaffRepository staffRepository;
    
    // Cache for role names, ideally should be fetched from a role repository
    // This is a simplification for now, in a real implementation we would inject the role repository
    private final Map<Long, String> roleCache = Map.of(
        1L, "TEACHER",
        2L, "PRINCIPAL",
        3L, "ADMIN_OFFICER",
        4L, "MANAGEMENT",
        5L, "ACCOUNT_OFFICER",
        6L, "LIBRARIAN"
    );
    
    @Autowired
    public ConsolidatedStaffServiceImpl(ConsolidatedStaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    @Override
    public List<ConsolidatedStaff> getAllStaff() {
        List<ConsolidatedStaff> allStaff = staffRepository.findAll();
        allStaff.forEach(this::enrichWithRoleName);
        return allStaff;
    }

    @Override
    public Page<ConsolidatedStaff> getAllStaffPaginated(Pageable pageable) {
        Page<ConsolidatedStaff> staffPage = staffRepository.findAll(pageable);
        staffPage.forEach(this::enrichWithRoleName);
        return staffPage;
    }

    @Override
    public ConsolidatedStaff getStaffById(Long id) {
        ConsolidatedStaff staff = staffRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Staff not found with ID: " + id));
        enrichWithRoleName(staff);
        return staff;
    }

    @Override
    public ConsolidatedStaff getStaffByStaffId(String staffId) {
        ConsolidatedStaff staff = staffRepository.findByStaffId(staffId)
            .orElseThrow(() -> new NoSuchElementException("Staff not found with staff ID: " + staffId));
        enrichWithRoleName(staff);
        return staff;
    }

    @Override
    public ConsolidatedStaff getStaffByEmail(String email) {
        ConsolidatedStaff staff = staffRepository.findByEmail(email)
            .orElseThrow(() -> new NoSuchElementException("Staff not found with email: " + email));
        enrichWithRoleName(staff);
        return staff;
    }

    @Override
    public List<ConsolidatedStaff> getStaffByRoleId(Long roleId) {
        List<ConsolidatedStaff> staffList = staffRepository.findByRoleId(roleId);
        staffList.forEach(this::enrichWithRoleName);
        return staffList;
    }

    @Override
    public List<ConsolidatedStaff> getActiveStaff() {
        List<ConsolidatedStaff> activeStaff = staffRepository.findByIsActiveTrue();
        activeStaff.forEach(this::enrichWithRoleName);
        return activeStaff;
    }

    @Override
    public List<ConsolidatedStaff> getStaffByRoleName(String roleName) {
        // Get the role ID for the given role name
        Long roleId = roleCache.entrySet().stream()
            .filter(entry -> entry.getValue().equalsIgnoreCase(roleName))
            .map(Map.Entry::getKey)
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid role name: " + roleName));
        
        return getStaffByRoleId(roleId);
    }

    @Override
    @Transactional
    public ConsolidatedStaff createStaff(ConsolidatedStaff staff) {
        // Set default values if needed
        if (staff.getIsActive() == null) {
            staff.setIsActive(true);
        }
        
        if (staff.getEmploymentStatus() == null) {
            staff.setEmploymentStatus(EmploymentStatus.ACTIVE);
        }
        
        // Set audit timestamps
        LocalDateTime now = LocalDateTime.now();
        staff.setCreatedAt(now);
        staff.setUpdatedAt(now);
        
        ConsolidatedStaff savedStaff = staffRepository.save(staff);
        enrichWithRoleName(savedStaff);
        return savedStaff;
    }

    @Override
    @Transactional
    public ConsolidatedStaff updateStaff(Long id, ConsolidatedStaff staff) {
        // Verify staff exists
        ConsolidatedStaff existingStaff = getStaffById(id);
        
        // Update fields
        existingStaff.setFirstName(staff.getFirstName());
        existingStaff.setLastName(staff.getLastName());
        existingStaff.setEmail(staff.getEmail());
        existingStaff.setPhoneNumber(staff.getPhoneNumber());
        existingStaff.setAddress(staff.getAddress());
        existingStaff.setDateOfBirth(staff.getDateOfBirth());
        existingStaff.setGender(staff.getGender());
        existingStaff.setQualifications(staff.getQualifications());
        existingStaff.setEmergencyContact(staff.getEmergencyContact());
        existingStaff.setBloodGroup(staff.getBloodGroup());
        existingStaff.setProfileImage(staff.getProfileImage());
        
        if (staff.getRoleId() != null) {
            existingStaff.setRoleId(staff.getRoleId());
        }
        
        // Only update financial details if provided
        if (staff.getBasicSalary() != null) existingStaff.setBasicSalary(staff.getBasicSalary());
        if (staff.getHra() != null) existingStaff.setHra(staff.getHra());
        if (staff.getDa() != null) existingStaff.setDa(staff.getDa());
        if (staff.getTa() != null) existingStaff.setTa(staff.getTa());
        if (staff.getOtherAllowances() != null) existingStaff.setOtherAllowances(staff.getOtherAllowances());
        if (staff.getPfContribution() != null) existingStaff.setPfContribution(staff.getPfContribution());
        if (staff.getTaxDeduction() != null) existingStaff.setTaxDeduction(staff.getTaxDeduction());
        if (staff.getNetSalary() != null) existingStaff.setNetSalary(staff.getNetSalary());
        if (staff.getSalaryAccountNumber() != null) existingStaff.setSalaryAccountNumber(staff.getSalaryAccountNumber());
        if (staff.getBankName() != null) existingStaff.setBankName(staff.getBankName());
        if (staff.getIfscCode() != null) existingStaff.setIfscCode(staff.getIfscCode());
        if (staff.getPfUAN() != null) existingStaff.setPfUAN(staff.getPfUAN());
        if (staff.getGratuity() != null) existingStaff.setGratuity(staff.getGratuity());
        
        // Update employment status
        if (staff.getEmploymentStatus() != null) {
            existingStaff.setEmploymentStatus(staff.getEmploymentStatus());
        }
        
        // Update timestamp
        existingStaff.setUpdatedAt(LocalDateTime.now());
        
        ConsolidatedStaff updatedStaff = staffRepository.save(existingStaff);
        enrichWithRoleName(updatedStaff);
        return updatedStaff;
    }

    @Override
    @Transactional
    public void deleteStaff(Long id) {
        // Verify staff exists
        getStaffById(id);
        
        // Delete the staff
        staffRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ConsolidatedStaff deactivateStaff(Long id) {
        ConsolidatedStaff staff = getStaffById(id);
        staff.setIsActive(false);
        staff.setUpdatedAt(LocalDateTime.now());
        
        ConsolidatedStaff updatedStaff = staffRepository.save(staff);
        enrichWithRoleName(updatedStaff);
        return updatedStaff;
    }

    @Override
    @Transactional
    public ConsolidatedStaff activateStaff(Long id) {
        ConsolidatedStaff staff = getStaffById(id);
        staff.setIsActive(true);
        staff.setUpdatedAt(LocalDateTime.now());
        
        ConsolidatedStaff updatedStaff = staffRepository.save(staff);
        enrichWithRoleName(updatedStaff);
        return updatedStaff;
    }

    @Override
    @Transactional
    public ConsolidatedStaff updateStaffStatus(Long id, EmploymentStatus status) {
        ConsolidatedStaff staff = getStaffById(id);
        staff.setEmploymentStatus(status);
        staff.setUpdatedAt(LocalDateTime.now());
        
        // If terminated, set service end date to today
        if (status == EmploymentStatus.TERMINATED || status == EmploymentStatus.RESIGNED || status == EmploymentStatus.RETIRED) {
            staff.setServiceEndDate(java.time.LocalDate.now());
        }
        
        ConsolidatedStaff updatedStaff = staffRepository.save(staff);
        enrichWithRoleName(updatedStaff);
        return updatedStaff;
    }

    @Override
    public List<ConsolidatedStaff> searchStaffByName(String query) {
        List<ConsolidatedStaff> searchResults = staffRepository.searchByName(query);
        searchResults.forEach(this::enrichWithRoleName);
        return searchResults;
    }

    @Override
    public List<ConsolidatedStaff> getAllTeachers() {
        return getStaffByRoleName("TEACHER");
    }

    @Override
    @Transactional
    public List<ConsolidatedStaff> bulkCreateStaff(List<ConsolidatedStaff> staffList) {
        LocalDateTime now = LocalDateTime.now();
        staffList.forEach(staff -> {
            if (staff.getIsActive() == null) staff.setIsActive(true);
            if (staff.getEmploymentStatus() == null) staff.setEmploymentStatus(EmploymentStatus.ACTIVE);
            staff.setCreatedAt(now);
            staff.setUpdatedAt(now);
        });
        
        List<ConsolidatedStaff> savedStaff = staffRepository.saveAll(staffList);
        savedStaff.forEach(this::enrichWithRoleName);
        return savedStaff;
    }
    
    /**
     * Helper method to enrich staff with role name
     */
    private void enrichWithRoleName(ConsolidatedStaff staff) {
        if (staff.getRoleId() != null) {
            staff.setRoleName(roleCache.getOrDefault(staff.getRoleId(), "UNKNOWN"));
        }
    }
}
