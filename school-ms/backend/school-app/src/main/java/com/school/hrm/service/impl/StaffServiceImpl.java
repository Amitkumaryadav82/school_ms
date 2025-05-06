package com.school.hrm.service.impl;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.school.hrm.dto.StaffDTO;
import com.school.hrm.dto.TeacherDetailsDTO;
import com.school.hrm.entity.Staff;
import com.school.hrm.entity.StaffRole;
import com.school.hrm.entity.Teacher;
import com.school.hrm.entity.StaffDesignation;
import com.school.hrm.entity.StaffDesignationMapping;
import com.school.hrm.repository.StaffRepository;
import com.school.hrm.repository.StaffRoleRepository;
import com.school.hrm.repository.TeacherRepository;
import com.school.hrm.repository.StaffDesignationRepository;
import com.school.hrm.repository.StaffDesignationMappingRepository;
import com.school.hrm.service.StaffService;
import com.school.exception.ResourceNotFoundException;

@Service
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final StaffRoleRepository staffRoleRepository;
    private final TeacherRepository teacherRepository;
    private final StaffDesignationRepository staffDesignationRepository;
    private final StaffDesignationMappingRepository staffDesignationMappingRepository;

    @Autowired
    public StaffServiceImpl(
            StaffRepository staffRepository,
            StaffRoleRepository staffRoleRepository,
            TeacherRepository teacherRepository,
            StaffDesignationRepository staffDesignationRepository,
            StaffDesignationMappingRepository staffDesignationMappingRepository) {
        this.staffRepository = staffRepository;
        this.staffRoleRepository = staffRoleRepository;
        this.teacherRepository = teacherRepository;
        this.staffDesignationRepository = staffDesignationRepository;
        this.staffDesignationMappingRepository = staffDesignationMappingRepository;
    }

    @Override
    public List<StaffDTO> getAllStaff() {
        List<Staff> staffList = staffRepository.findAll();
        return staffList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public StaffDTO getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
        return convertToDTO(staff);
    }

    @Override
    public StaffDTO getStaffByStaffId(String staffId) {
        Staff staff = staffRepository.findByStaffId(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with staff ID: " + staffId));
        return convertToDTO(staff);
    }

    @Override
    public StaffDTO getStaffByEmail(String email) {
        Staff staff = staffRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with email: " + email));
        return convertToDTO(staff);
    }

    @Override
    public List<StaffDTO> getStaffByRole(String roleName) {
        List<Staff> staffList = staffRepository.findByRoleRoleName(roleName);
        return staffList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffDTO> getActiveStaff() {
        List<Staff> staffList = staffRepository.findByIsActive(true);
        return staffList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffDTO> getAllTeachers() {
        List<Staff> teachers = staffRepository.findAllTeachers();
        return teachers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffDTO> getAllPrincipals() {
        List<Staff> principals = staffRepository.findAllPrincipals();
        return principals.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffDTO> getAllAdminOfficers() {
        List<Staff> adminOfficers = staffRepository.findAllAdminOfficers();
        return adminOfficers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffDTO> getAllManagementStaff() {
        List<Staff> managementStaff = staffRepository.findAllManagementStaff();
        return managementStaff.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffDTO> getAllAccountOfficers() {
        List<Staff> accountOfficers = staffRepository.findAllAccountOfficers();
        return accountOfficers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffDTO> getAllLibrarians() {
        List<Staff> librarians = staffRepository.findAllLibrarians();
        return librarians.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StaffDTO createStaff(StaffDTO staffDTO) {
        // Validate that role is provided
        if (staffDTO.getRole() == null || staffDTO.getRole().trim().isEmpty()) {
            throw new IllegalArgumentException("Staff role cannot be null or empty");
        }

        // Find or create the role
        StaffRole role = staffRoleRepository.findByRoleName(staffDTO.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + staffDTO.getRole()));

        // Create new staff entity
        Staff staff = new Staff();
        staff.setStaffId(staffDTO.getStaffId());
        staff.setFirstName(staffDTO.getFirstName());
        staff.setLastName(staffDTO.getLastName());
        staff.setEmail(staffDTO.getEmail());
        staff.setPhoneNumber(staffDTO.getPhoneNumber());
        staff.setAddress(staffDTO.getAddress());
        staff.setDateOfBirth(staffDTO.getDateOfBirth());
        staff.setGender(staffDTO.getGender());
        staff.setJoinDate(staffDTO.getJoinDate());
        staff.setRole(role);  // Role assignment is now guaranteed
        staff.setIsActive(true);
        staff.setQualifications(staffDTO.getQualifications());
        staff.setEmergencyContact(staffDTO.getEmergencyContact());
        staff.setBloodGroup(staffDTO.getBloodGroup());
        staff.setProfileImage(staffDTO.getProfileImage());
        staff.setCreatedAt(LocalDateTime.now());
        staff.setUpdatedAt(LocalDateTime.now());

        // Save the staff
        Staff savedStaff = staffRepository.save(staff);

        // If this is a teacher, create teacher details
        if ("Teacher".equalsIgnoreCase(staffDTO.getRole()) && staffDTO.getTeacherDetails() != null) {
            Teacher teacher = new Teacher();
            teacher.setStaff(savedStaff);
            teacher.setDepartment(staffDTO.getTeacherDetails().getDepartment());
            teacher.setSpecialization(staffDTO.getTeacherDetails().getSpecialization());
            teacher.setSubjects(staffDTO.getTeacherDetails().getSubjects());
            teacher.setTeachingExperience(staffDTO.getTeacherDetails().getTeachingExperience());
            teacher.setIsClassTeacher(staffDTO.getTeacherDetails().getIsClassTeacher() != null
                    ? staffDTO.getTeacherDetails().getIsClassTeacher()
                    : false);
            teacher.setClassAssignedId(staffDTO.getTeacherDetails().getClassAssignedId());
            teacher.setCreatedAt(LocalDateTime.now());
            teacher.setUpdatedAt(LocalDateTime.now());

            // Save teacher details
            teacherRepository.save(teacher);
        }

        return convertToDTO(savedStaff);
    }

    @Override
    @Transactional
    public StaffDTO updateStaff(Long id, StaffDTO staffDTO) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        // Update staff details
        if (staffDTO.getFirstName() != null) {
            staff.setFirstName(staffDTO.getFirstName());
        }
        if (staffDTO.getLastName() != null) {
            staff.setLastName(staffDTO.getLastName());
        }
        if (staffDTO.getEmail() != null) {
            staff.setEmail(staffDTO.getEmail());
        }
        if (staffDTO.getPhoneNumber() != null) {
            staff.setPhoneNumber(staffDTO.getPhoneNumber());
        }
        if (staffDTO.getAddress() != null) {
            staff.setAddress(staffDTO.getAddress());
        }
        if (staffDTO.getDateOfBirth() != null) {
            staff.setDateOfBirth(staffDTO.getDateOfBirth());
        }
        if (staffDTO.getGender() != null) {
            staff.setGender(staffDTO.getGender());
        }
        if (staffDTO.getJoinDate() != null) {
            staff.setJoinDate(staffDTO.getJoinDate());
        }
        if (staffDTO.getRole() != null) {
            // Validate that role is not empty
            if (staffDTO.getRole().trim().isEmpty()) {
                throw new IllegalArgumentException("Staff role cannot be empty");
            }
            
            StaffRole role = staffRoleRepository.findByRoleName(staffDTO.getRole())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + staffDTO.getRole()));
            staff.setRole(role);
        }
        if (staffDTO.getIsActive() != null) {
            staff.setIsActive(staffDTO.getIsActive());
        }
        if (staffDTO.getQualifications() != null) {
            staff.setQualifications(staffDTO.getQualifications());
        }
        if (staffDTO.getEmergencyContact() != null) {
            staff.setEmergencyContact(staffDTO.getEmergencyContact());
        }
        if (staffDTO.getBloodGroup() != null) {
            staff.setBloodGroup(staffDTO.getBloodGroup());
        }
        if (staffDTO.getProfileImage() != null) {
            staff.setProfileImage(staffDTO.getProfileImage());
        }
        staff.setUpdatedAt(LocalDateTime.now());

        // Save updated staff
        Staff updatedStaff = staffRepository.save(staff);

        // Update teacher details if applicable
        if ("Teacher".equalsIgnoreCase(staff.getRole().getRoleName()) && staffDTO.getTeacherDetails() != null) {
            Teacher teacher = teacherRepository.findByStaff(staff)
                    .orElse(new Teacher());

            if (teacher.getId() == null) {
                teacher.setStaff(staff);
                teacher.setCreatedAt(LocalDateTime.now());
            }

            if (staffDTO.getTeacherDetails().getDepartment() != null) {
                teacher.setDepartment(staffDTO.getTeacherDetails().getDepartment());
            }
            if (staffDTO.getTeacherDetails().getSpecialization() != null) {
                teacher.setSpecialization(staffDTO.getTeacherDetails().getSpecialization());
            }
            if (staffDTO.getTeacherDetails().getSubjects() != null) {
                teacher.setSubjects(staffDTO.getTeacherDetails().getSubjects());
            }
            if (staffDTO.getTeacherDetails().getTeachingExperience() != null) {
                teacher.setTeachingExperience(staffDTO.getTeacherDetails().getTeachingExperience());
            }
            if (staffDTO.getTeacherDetails().getIsClassTeacher() != null) {
                teacher.setIsClassTeacher(staffDTO.getTeacherDetails().getIsClassTeacher());
            }
            if (staffDTO.getTeacherDetails().getClassAssignedId() != null) {
                teacher.setClassAssignedId(staffDTO.getTeacherDetails().getClassAssignedId());
            }
            teacher.setUpdatedAt(LocalDateTime.now());

            teacherRepository.save(teacher);
        }

        return convertToDTO(updatedStaff);
    }

    @Override
    @Transactional
    public void deleteStaff(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        // If the staff is a teacher, delete the teacher details first
        if ("Teacher".equalsIgnoreCase(staff.getRole().getRoleName())) {
            teacherRepository.findByStaff(staff).ifPresent(teacherRepository::delete);
        }

        // Delete the staff
        staffRepository.delete(staff);
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