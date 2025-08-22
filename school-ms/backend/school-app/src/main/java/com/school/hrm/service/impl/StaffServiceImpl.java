package com.school.hrm.service.impl;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.school.hrm.dto.StaffDTO;
import com.school.hrm.dto.TeacherDetailsDTO;
import com.school.hrm.entity.Staff;
import com.school.hrm.entity.StaffDesignation;
import com.school.hrm.entity.StaffDesignationMapping;
import com.school.hrm.model.EmploymentStatus;
import com.school.hrm.repository.StaffRepository;
// import com.school.hrm.repository.StaffRoleRepository; // removed unused
import com.school.hrm.repository.TeacherRepository;
import com.school.hrm.repository.StaffDesignationRepository;
import com.school.hrm.repository.StaffDesignationMappingRepository;
import com.school.hrm.service.StaffService;
import com.school.exception.ResourceNotFoundException;
import com.school.staff.adapter.StaffEntityAdapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Implementation of the StaffService interface for HRM module.
 * 
 * @deprecated This implementation is deprecated in favor of com.school.core.service.StaffServiceImpl.
 * This class now delegates most operations to the core service via StaffEntityAdapter.
 * See PACKAGE-MIGRATION-PLAN.md for more details.
 */
@Service
@Qualifier("hrmStaffService")
@Deprecated
public class StaffServiceImpl implements StaffService {
    private static final Logger log = LoggerFactory.getLogger(StaffServiceImpl.class);

    // Dependencies
    private final StaffRepository staffRepository;
    private final TeacherRepository teacherRepository;
    private final StaffDesignationRepository staffDesignationRepository;
    private final StaffDesignationMappingRepository staffDesignationMappingRepository;
    private final com.school.core.service.StaffService coreStaffService;
    private final StaffEntityAdapter staffEntityAdapter;

    public StaffServiceImpl(
            @Qualifier("hrmStaffRepository") StaffRepository staffRepository,
            TeacherRepository teacherRepository,
            StaffDesignationRepository staffDesignationRepository,
            StaffDesignationMappingRepository staffDesignationMappingRepository,
            @Qualifier("coreStaffServiceImpl") com.school.core.service.StaffService coreStaffService,
            StaffEntityAdapter staffEntityAdapter) {
        this.staffRepository = staffRepository;
        this.teacherRepository = teacherRepository;
        this.staffDesignationRepository = staffDesignationRepository;
        this.staffDesignationMappingRepository = staffDesignationMappingRepository;
        this.coreStaffService = coreStaffService;
        this.staffEntityAdapter = staffEntityAdapter;
    }

    @Override
    public List<StaffDTO> getAllStaff() {
        return staffEntityAdapter.convertCoreStaffListToHrmDTOList(coreStaffService.getAllStaff());
    }

    @Override
    public Staff getStaffById(Long id) {
        // Since interface expects Staff entity but we're migrating to core Staff
        // This is a workaround until full migration is complete
        Optional<com.school.core.model.Staff> coreStaff = coreStaffService.getStaffById(id);
        if (coreStaff.isPresent()) {
            Staff staff = new Staff();
            staff.setId(coreStaff.get().getId());
            staff.setStaffId(coreStaff.get().getStaffId());
            staff.setFirstName(coreStaff.get().getFirstName());
            staff.setLastName(coreStaff.get().getLastName());
            staff.setEmail(coreStaff.get().getEmail());
            staff.setPhoneNumber(coreStaff.get().getPhone());
            return staff;
        }
        return null;
    }
    
    @Override
    public StaffDTO getStaffDtoById(Long id) {
        return coreStaffService.getStaffById(id)
                .map(staffEntityAdapter::convertCoreStaffToHrmDTO)
                .orElse(null);
    }

    @Override
    public StaffDTO getStaffByEmail(String email) {
        return coreStaffService.getStaffByEmail(email)
                .map(staffEntityAdapter::convertCoreStaffToHrmDTO)
                .orElse(null);
    }

    @Override
    public List<StaffDTO> getStaffByRole(String roleName) {
        // Implement using find by role method and then filter
        return staffEntityAdapter.convertCoreStaffListToHrmDTOList(
                coreStaffService.getAllStaff().stream()
                        .filter(staff -> staff.getStaffRole() != null && 
                                roleName.equals(staff.getStaffRole().getRoleName()))
                        .collect(Collectors.toList())
        );
    }

    public List<StaffDTO> getActiveStaff() {
        // Filter the staff list for active staff
        return staffEntityAdapter.convertCoreStaffListToHrmDTOList(
                coreStaffService.getAllStaff().stream()
                        .filter(com.school.core.model.Staff::isActive)
                        .collect(Collectors.toList())
        );
    }

    public List<StaffDTO> getAllTeachers() {
        return getStaffByRole("TEACHER");
    }

    public List<StaffDTO> getAllPrincipals() {
        return getStaffByRole("PRINCIPAL");
    }

    public List<StaffDTO> getAllAdminOfficers() {
        return getStaffByRole("ADMIN");
    }

    public List<StaffDTO> getAllManagementStaff() {
        return getStaffByRole("MANAGEMENT");
    }

    public List<StaffDTO> getAllAccountOfficers() {
        return getStaffByRole("ACCOUNTANT");
    }

    public List<StaffDTO> getAllLibrarians() {
        return getStaffByRole("LIBRARIAN");
    }
    
    @Override
    public List<StaffDTO> getStaffByDepartment(String department) {
        // Filter staff list by department
        return staffEntityAdapter.convertCoreStaffListToHrmDTOList(
                coreStaffService.getAllStaff().stream()
                        .filter(staff -> department != null && department.equals(staff.getDepartment()))
                        .collect(Collectors.toList())
        );
    }
    
    @Override
    public StaffDTO getStaffByPhone(String phone) {
        // Find staff by phone number
        return coreStaffService.getAllStaff().stream()
                .filter(staff -> phone != null && phone.equals(staff.getPhone()))
                .findFirst()
                .map(staffEntityAdapter::convertCoreStaffToHrmDTO)
                .orElse(null);
    }
    
    @Override
    public List<StaffDTO> searchStaffByName(String name) {
        // Search staff by name
        if (name == null || name.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        String searchTerm = name.toLowerCase();
        return staffEntityAdapter.convertCoreStaffListToHrmDTOList(
                coreStaffService.getAllStaff().stream()
                        .filter(staff -> 
                            (staff.getFirstName() != null && staff.getFirstName().toLowerCase().contains(searchTerm)) ||
                            (staff.getLastName() != null && staff.getLastName().toLowerCase().contains(searchTerm)))
                        .collect(Collectors.toList())
        );
    }
    
    @Override
    public List<StaffDTO> getStaffByEmploymentStatus(EmploymentStatus status) {
        // Filter by employment status
        return staffEntityAdapter.convertCoreStaffListToHrmDTOList(
                coreStaffService.getAllStaff().stream()
                        .filter(staff -> {
                            if (staff.getEmploymentStatus() == null) return false;
                            // Map between different employment status enums
                            String statusName = staff.getEmploymentStatus().name();
                            return statusName.equals(status.name());
                        })
                        .collect(Collectors.toList())
        );
    }

    // Removed duplicate implementation of getStaffByDesignation
    @Override
    @Transactional
    public StaffDTO createStaff(StaffDTO staffDTO) {
        // Convert DTO to core Staff
        com.school.core.model.Staff coreStaff = new com.school.core.model.Staff();
        coreStaff.setStaffId(staffDTO.getStaffId());
        coreStaff.setFirstName(staffDTO.getFirstName());
        coreStaff.setLastName(staffDTO.getLastName());
        coreStaff.setEmail(staffDTO.getEmail());
        coreStaff.setPhone(staffDTO.getPhoneNumber());
        coreStaff.setDateOfBirth(staffDTO.getDateOfBirth());
        coreStaff.setAddress(staffDTO.getAddress());
        coreStaff.setJoiningDate(staffDTO.getJoinDate());
        coreStaff.setActive(staffDTO.getIsActive() != null ? staffDTO.getIsActive() : false);
        // Get or create the staff role
        if (staffDTO.getRole() != null) {
            // Create a StaffRole object using the role name from DTO
            com.school.core.model.StaffRole staffRole = new com.school.core.model.StaffRole();
            staffRole.setName(staffDTO.getRole());
            coreStaff.setRole(staffRole);
        }
        
        com.school.core.model.Staff savedStaff = coreStaffService.createStaff(coreStaff);
        return staffEntityAdapter.convertCoreStaffToHrmDTO(savedStaff);
    }

    @Override
    @Transactional
    public StaffDTO updateStaff(Long id, StaffDTO staffDTO) {
        return coreStaffService.getStaffById(id)
                .map(existingStaff -> {
                    // Update core Staff fields from DTO
                    if (staffDTO.getStaffId() != null) existingStaff.setStaffId(staffDTO.getStaffId());
                    if (staffDTO.getFirstName() != null) existingStaff.setFirstName(staffDTO.getFirstName());
                    if (staffDTO.getLastName() != null) existingStaff.setLastName(staffDTO.getLastName());
                    if (staffDTO.getEmail() != null) existingStaff.setEmail(staffDTO.getEmail());
                    if (staffDTO.getPhoneNumber() != null) existingStaff.setPhone(staffDTO.getPhoneNumber());
                    if (staffDTO.getDateOfBirth() != null) existingStaff.setDateOfBirth(staffDTO.getDateOfBirth());
                    if (staffDTO.getAddress() != null) existingStaff.setAddress(staffDTO.getAddress());
                    if (staffDTO.getJoinDate() != null) existingStaff.setJoiningDate(staffDTO.getJoinDate());
                    if (staffDTO.getIsActive() != null) existingStaff.setActive(staffDTO.getIsActive());
                    // Update the staff role if provided
                    if (staffDTO.getRole() != null) {
                        // Create a StaffRole object using the role name from DTO
                        com.school.core.model.StaffRole staffRole = new com.school.core.model.StaffRole();
                        staffRole.setName(staffDTO.getRole());
                        existingStaff.setRole(staffRole);
                    }
                    
                    com.school.core.model.Staff updatedStaff = coreStaffService.updateStaff(id, existingStaff)
                        .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
                    return staffEntityAdapter.convertCoreStaffToHrmDTO(updatedStaff);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
    }

    @Override
    @Transactional
    public void deleteStaff(Long id) {
        coreStaffService.deleteStaff(id);
    }

    @Transactional
    public void deactivateStaff(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
        staff.setIsActive(false);
        staff.setUpdatedAt(LocalDateTime.now());
        staffRepository.save(staff);
    }
    
    @Transactional
    public void activateStaff(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
        staff.setIsActive(true);
        staff.setUpdatedAt(LocalDateTime.now());
        staffRepository.save(staff);
    }

    @Override
    public List<StaffDTO> getStaffByDesignation(String designationName) {
        // This method uses the mapping repository to find specifically active teachers 
        // with the given designation
        List<StaffDesignationMapping> mappings = staffDesignationMappingRepository
                .findActiveTeachersByDesignationName(designationName);

        return mappings.stream()
                .map(mapping -> convertToDTO(mapping.getStaff()))
                .collect(Collectors.toList());
    }

    @Transactional
    public StaffDTO assignDesignationToStaff(Long staffId, Long designationId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));

        StaffDesignation designation = staffDesignationRepository.findById(designationId)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found with id: " + designationId));

        // Check if this mapping already exists
        Optional<StaffDesignationMapping> existingMapping = staffDesignationMappingRepository
                .findByStaffAndDesignation(staff, designation);

        if (existingMapping.isPresent()) {
            // If mapping exists but is inactive, reactivate it
            if (!existingMapping.get().getIsActive()) {
                existingMapping.get().setIsActive(true);
                existingMapping.get().setUpdatedAt(LocalDateTime.now());
                staffDesignationMappingRepository.save(existingMapping.get());
            }
            // Otherwise, do nothing as the staff already has this designation
        } else {
            // Create a new mapping
            StaffDesignationMapping mapping = new StaffDesignationMapping();
            mapping.setStaff(staff);
            mapping.setDesignation(designation);
            mapping.setAssignedDate(LocalDate.now());
            mapping.setIsActive(true);
            mapping.setCreatedAt(LocalDateTime.now());
            mapping.setUpdatedAt(LocalDateTime.now());
            staffDesignationMappingRepository.save(mapping);
        }
        return convertToDTO(staff);
    }
    
    @Transactional
    public void removeDesignationFromStaff(Long staffId, Long designationId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));

        StaffDesignation designation = staffDesignationRepository.findById(designationId)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found with id: " + designationId));

        // Find the mapping
        StaffDesignationMapping mapping = staffDesignationMappingRepository
                .findByStaffAndDesignation(staff, designation)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Designation " + designation.getName() + " is not assigned to staff with ID: " + staffId));

        // Instead of deleting, mark as inactive
        mapping.setIsActive(false);
        mapping.setUpdatedAt(LocalDateTime.now());
        staffDesignationMappingRepository.save(mapping);
    }
    
    @Transactional
    public StaffDTO updateStaffStatus(Long id, EmploymentStatus status) {
        // Debug: Log attempt to update status with details
        log.debug("Attempting to update staff status: Staff ID={}, New Status={}", id, status);

        try {
            // Get authentication context
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();

            if (auth != null) {
                log.debug("User performing status update: {}, Authorities: {}", auth.getName(), auth.getAuthorities());
            } else {
                log.warn("No authentication context available!");
            }

            Staff staff = staffRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

            log.debug("Found staff: {} {}, Current status: {}", staff.getFirstName(), staff.getLastName(), staff.getEmploymentStatus());

            // Update the employment status
            staff.setEmploymentStatus(status);

            // Adjust isActive flag based on status
            if (status == EmploymentStatus.ACTIVE) {
                staff.setIsActive(true);
                log.debug("Setting staff to ACTIVE state");
            } else if (status == EmploymentStatus.SUSPENDED ||
                    status == EmploymentStatus.TERMINATED ||
                    status == EmploymentStatus.RETIRED ||
                    status == EmploymentStatus.RESIGNED) {
                // Set isActive to false for these statuses
                staff.setIsActive(false);
                log.debug("Setting staff to INACTIVE state due to {} status", status);

                // Set the termination date to today for terminated or resigned staff
                if ((status == EmploymentStatus.TERMINATED ||
                        status == EmploymentStatus.RESIGNED ||
                        status == EmploymentStatus.RETIRED) &&
                        staff.getTerminationDate() == null) {
                    staff.setTerminationDate(LocalDate.now());
                    log.debug("Setting termination date to today");
                }
            }

            staff.setUpdatedAt(LocalDateTime.now());

            try {
                Staff updatedStaff = staffRepository.save(staff);
                log.debug("Successfully saved staff status update");
                return convertToDTO(updatedStaff);
            } catch (Exception e) {
                log.error("Error saving staff status update: {}", e.getMessage(), e);
                throw e;
            }
        } catch (Exception e) {
            log.error("Exception in updateStaffStatus: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Helper method to convert Staff entity to StaffDTO
    private StaffDTO convertToDTO(Staff staff) {
        StaffDTO dto = new StaffDTO();
        dto.setId(staff.getId());
        dto.setStaffId(staff.getStaffId());
        dto.setFirstName(staff.getFirstName());
        dto.setLastName(staff.getLastName());
        dto.setFullName(staff.getFullName());
        dto.setEmail(staff.getEmail());
        dto.setPhoneNumber(staff.getPhoneNumber());
        dto.setAddress(staff.getAddress());
        dto.setDateOfBirth(staff.getDateOfBirth());
        dto.setGender(staff.getGender());
        dto.setJoinDate(staff.getJoinDate());
        dto.setRole(staff.getRole().getRoleName());
        dto.setRoleId(staff.getRole().getId());
        dto.setIsActive(staff.getIsActive());
        dto.setQualifications(staff.getQualifications());
        dto.setEmergencyContact(staff.getEmergencyContact());
        dto.setBloodGroup(staff.getBloodGroup());
        dto.setProfileImage(staff.getProfileImage());

        // Include teacher details if applicable
        if ("Teacher".equalsIgnoreCase(staff.getRole().getRoleName())) {
            teacherRepository.findByStaff(staff).ifPresent(teacher -> {
                TeacherDetailsDTO teacherDTO = new TeacherDetailsDTO();
                teacherDTO.setId(teacher.getId());
                teacherDTO.setDepartment(teacher.getDepartment());
                teacherDTO.setSpecialization(teacher.getSpecialization());
                teacherDTO.setSubjects(teacher.getSubjects());
                teacherDTO.setTeachingExperience(teacher.getTeachingExperience());
                teacherDTO.setIsClassTeacher(teacher.getIsClassTeacher());
                teacherDTO.setClassAssignedId(teacher.getClassAssignedId());

                dto.setTeacherDetails(teacherDTO);
            });
        }

        return dto;
    }
}