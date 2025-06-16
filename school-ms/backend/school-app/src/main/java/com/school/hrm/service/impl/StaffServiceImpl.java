package com.school.hrm.service.impl;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.school.hrm.dto.StaffDTO;
import com.school.hrm.dto.TeacherDetailsDTO;
import com.school.hrm.entity.Staff;
import com.school.hrm.entity.StaffRole;
import com.school.hrm.entity.Teacher;
import com.school.hrm.entity.StaffDesignation;
import com.school.hrm.entity.StaffDesignationMapping;
import com.school.hrm.model.EmploymentStatus;
import com.school.hrm.repository.StaffRepository;
import com.school.hrm.repository.StaffRoleRepository;
import com.school.hrm.repository.TeacherRepository;
import com.school.hrm.repository.StaffDesignationRepository;
import com.school.hrm.repository.StaffDesignationMappingRepository;
import com.school.hrm.service.StaffService;
import com.school.exception.ResourceNotFoundException;
import com.school.staff.adapter.StaffEntityAdapter;

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
public class StaffServiceImpl implements StaffService {    private final StaffRepository staffRepository;
    private final StaffRoleRepository staffRoleRepository;
    private final TeacherRepository teacherRepository;
    private final StaffDesignationRepository staffDesignationRepository;
    private final StaffDesignationMappingRepository staffDesignationMappingRepository;
    private final com.school.core.service.StaffService coreStaffService;

    @Autowired
    public StaffServiceImpl(
            @Qualifier("hrmStaffRepository") StaffRepository staffRepository,
            StaffRoleRepository staffRoleRepository,
            TeacherRepository teacherRepository,
            StaffDesignationRepository staffDesignationRepository,
            StaffDesignationMappingRepository staffDesignationMappingRepository,
            @Qualifier("coreStaffServiceImpl") com.school.core.service.StaffService coreStaffService) {
        this.staffRepository = staffRepository;
        this.staffRoleRepository = staffRoleRepository;
        this.teacherRepository = teacherRepository;
        this.staffDesignationRepository = staffDesignationRepository;
        this.staffDesignationMappingRepository = staffDesignationMappingRepository;
        this.coreStaffService = coreStaffService;
    }    @Autowired
    private StaffEntityAdapter staffEntityAdapter;

    @Override
    public List<StaffDTO> getAllStaff() {
        return staffEntityAdapter.convertCoreStaffListToHrmDTOList(coreStaffService.getAllStaff());
    }

    @Override
    public StaffDTO getStaffById(Long id) {
        return coreStaffService.getStaffById(id)
                .map(staffEntityAdapter::convertCoreStaffToHrmDTO)
                .orElse(null);
    }

    @Override
    public StaffDTO getStaffByStaffId(String staffId) {
        return coreStaffService.getStaffByStaffId(staffId)
                .map(staffEntityAdapter::convertCoreStaffToHrmDTO)
                .orElse(null);
    }    @Override
    public StaffDTO getStaffByEmail(String email) {
        return coreStaffService.getStaffByEmail(email)
                .map(staffEntityAdapter::convertCoreStaffToHrmDTO)
                .orElse(null);
    }

    @Override
    public List<StaffDTO> getStaffByRole(String roleName) {
        // Implement using find by role method and then filter
        return staffEntityAdapter.convertCoreStaffListToHrmDTOList(
                coreStaffService.getAllStaff().stream()                        .filter(staff -> staff.getStaffRole() != null && 
                                roleName.equals(staff.getStaffRole().getRoleName()))
                        .collect(Collectors.toList())
        );
    }

    @Override
    public List<StaffDTO> getActiveStaff() {
        // Filter the staff list for active staff
        return staffEntityAdapter.convertCoreStaffListToHrmDTOList(
                coreStaffService.getAllStaff().stream()
                        .filter(com.school.core.model.Staff::isActive)
                        .collect(Collectors.toList())
        );
    }

    @Override
    public List<StaffDTO> getAllTeachers() {
        return getStaffByRole("TEACHER");
    }

    @Override
    public List<StaffDTO> getAllPrincipals() {
        return getStaffByRole("PRINCIPAL");
    }

    @Override
    public List<StaffDTO> getAllAdminOfficers() {
        return getStaffByRole("ADMIN");
    }

    @Override
    public List<StaffDTO> getAllManagementStaff() {
        return getStaffByRole("MANAGEMENT");
    }

    @Override
    public List<StaffDTO> getAllAccountOfficers() {
        return getStaffByRole("ACCOUNTANT");
    }

    @Override
    public List<StaffDTO> getAllLibrarians() {
        return getStaffByRole("LIBRARIAN");
    }    @Override
    @Transactional
    public StaffDTO createStaff(StaffDTO staffDTO) {
        // Convert DTO to core Staff
        com.school.core.model.Staff coreStaff = new com.school.core.model.Staff();
        coreStaff.setStaffId(staffDTO.getStaffId());
        coreStaff.setFirstName(staffDTO.getFirstName());        coreStaff.setLastName(staffDTO.getLastName());
        coreStaff.setEmail(staffDTO.getEmail());
        coreStaff.setPhone(staffDTO.getPhoneNumber());
        coreStaff.setDateOfBirth(staffDTO.getDateOfBirth());
        coreStaff.setAddress(staffDTO.getAddress());
        coreStaff.setJoiningDate(staffDTO.getJoinDate());
        coreStaff.setActive(staffDTO.getIsActive() != null ? staffDTO.getIsActive() : false);
        
        // Get or create the staff role
        if (staffDTO.getRole() != null) {            Optional<StaffRole> role = staffRoleRepository.findByRoleName(staffDTO.getRole());
            coreStaff.setStaffRole(role.orElse(null));
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
                    if (staffDTO.getFirstName() != null) existingStaff.setFirstName(staffDTO.getFirstName());                    if (staffDTO.getLastName() != null) existingStaff.setLastName(staffDTO.getLastName());
                    if (staffDTO.getEmail() != null) existingStaff.setEmail(staffDTO.getEmail());
                    if (staffDTO.getPhoneNumber() != null) existingStaff.setPhone(staffDTO.getPhoneNumber());
                    if (staffDTO.getDateOfBirth() != null) existingStaff.setDateOfBirth(staffDTO.getDateOfBirth());
                    if (staffDTO.getAddress() != null) existingStaff.setAddress(staffDTO.getAddress());
                    if (staffDTO.getJoinDate() != null) existingStaff.setJoiningDate(staffDTO.getJoinDate());
                    if (staffDTO.getIsActive() != null) existingStaff.setActive(staffDTO.getIsActive());
                    
                    // Update the staff role if provided
                    if (staffDTO.getRole() != null) {                        Optional<StaffRole> role = staffRoleRepository.findByRoleName(staffDTO.getRole());
                        existingStaff.setStaffRole(role.orElse(null));
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

    @Override
    @Transactional
    public void deactivateStaff(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
        staff.setIsActive(false);
        staff.setUpdatedAt(LocalDateTime.now());
        staffRepository.save(staff);
    }

    @Override
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
        StaffDesignation designation = staffDesignationRepository.findByName(designationName)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found: " + designationName));

        List<StaffDesignationMapping> mappings = staffDesignationMappingRepository
                .findByDesignationAndIsActive(designation, true);

        return mappings.stream()
                .map(mapping -> convertToDTO(mapping.getStaff()))
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffDTO> getTeachersByDesignation(String designationName) {
        List<StaffDesignationMapping> mappings = staffDesignationMappingRepository
                .findActiveTeachersByDesignationName(designationName);

        return mappings.stream()
                .map(mapping -> convertToDTO(mapping.getStaff()))
                .collect(Collectors.toList());
    }

    @Override
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

    @Override
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

    @Override
    @Transactional
    public StaffDTO updateStaffStatus(Long id, EmploymentStatus status) {
        // Debug: Log attempt to update status with details
        System.out.println("[DEBUG] [" + LocalDateTime.now() + "] Attempting to update staff status: Staff ID=" + id
                + ", New Status=" + status);

        try {
            // Get authentication context
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();

            if (auth != null) {
                System.out.println("[DEBUG] [" + LocalDateTime.now() + "] User performing status update: " +
                        auth.getName() + ", Authorities: " + auth.getAuthorities());
            } else {
                System.out
                        .println("[DEBUG] [" + LocalDateTime.now() + "] WARNING: No authentication context available!");
            }

            Staff staff = staffRepository.findById(id)
                    .orElseThrow(() -> {
                        System.out
                                .println("[DEBUG] [" + LocalDateTime.now() + "] ERROR: Staff not found with id: " + id);
                        return new ResourceNotFoundException("Staff not found with id: " + id);
                    });

            System.out.println("[DEBUG] [" + LocalDateTime.now() + "] Found staff: " + staff.getFirstName() + " " +
                    staff.getLastName() + ", Current status: " + staff.getEmploymentStatus());

            // Update the employment status
            staff.setEmploymentStatus(status);

            // Adjust isActive flag based on status
            if (status == EmploymentStatus.ACTIVE) {
                staff.setIsActive(true);
                System.out.println("[DEBUG] [" + LocalDateTime.now() + "] Setting staff to ACTIVE state");
            } else if (status == EmploymentStatus.SUSPENDED ||
                    status == EmploymentStatus.TERMINATED ||
                    status == EmploymentStatus.RETIRED ||
                    status == EmploymentStatus.RESIGNED) {
                // Set isActive to false for these statuses
                staff.setIsActive(false);
                System.out.println("[DEBUG] [" + LocalDateTime.now() + "] Setting staff to INACTIVE state due to "
                        + status + " status");

                // Set the termination date to today for terminated or resigned staff
                if ((status == EmploymentStatus.TERMINATED ||
                        status == EmploymentStatus.RESIGNED ||
                        status == EmploymentStatus.RETIRED) &&
                        staff.getTerminationDate() == null) {
                    staff.setTerminationDate(LocalDate.now());
                    System.out.println("[DEBUG] [" + LocalDateTime.now() + "] Setting termination date to today");
                }
            }

            staff.setUpdatedAt(LocalDateTime.now());

            try {
                Staff updatedStaff = staffRepository.save(staff);
                System.out.println("[DEBUG] [" + LocalDateTime.now() + "] Successfully saved staff status update");
                return convertToDTO(updatedStaff);
            } catch (Exception e) {
                System.out.println(
                        "[DEBUG] [" + LocalDateTime.now() + "] ERROR saving staff status update: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        } catch (Exception e) {
            System.out
                    .println("[DEBUG] [" + LocalDateTime.now() + "] EXCEPTION in updateStaffStatus: " + e.getMessage());
            e.printStackTrace();
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