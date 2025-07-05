package com.school.exam.service.configuration.impl;

import com.school.exam.dto.configuration.SubjectMasterDTO;
import com.school.exam.dto.configuration.SubjectMasterRequest;
import com.school.exam.model.configuration.SubjectMaster;
import com.school.exam.model.configuration.SubjectType;
import com.school.exam.repository.configuration.SubjectMasterRepository;
import com.school.exam.service.configuration.SubjectMasterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of SubjectMasterService for managing subject master operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SubjectMasterServiceImpl implements SubjectMasterService {

    private final SubjectMasterRepository subjectMasterRepository;

    @Override
    public SubjectMasterDTO createSubject(SubjectMasterRequest request) {
        log.info("Creating new subject with code: {}", request.getSubjectCode());
        
        validateSubjectRequest(request, null);
        
        SubjectMaster subjectMaster = SubjectMaster.builder()
                .subjectCode(request.getSubjectCode().trim().toUpperCase())
                .subjectName(request.getSubjectName().trim())
                .description(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null)
                .subjectType(request.getSubjectType())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        SubjectMaster savedSubject = subjectMasterRepository.save(subjectMaster);
        log.info("Successfully created subject with ID: {}", savedSubject.getId());
        
        return convertToDTO(savedSubject);
    }

    @Override
    public SubjectMasterDTO updateSubject(Long id, SubjectMasterRequest request) {
        log.info("Updating subject with ID: {}", id);
        
        SubjectMaster existingSubject = subjectMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + id));
        
        validateSubjectRequest(request, id);
        
        existingSubject.setSubjectCode(request.getSubjectCode().trim().toUpperCase());
        existingSubject.setSubjectName(request.getSubjectName().trim());
        existingSubject.setDescription(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null);
        existingSubject.setSubjectType(request.getSubjectType());
        existingSubject.setIsActive(request.getIsActive() != null ? request.getIsActive() : existingSubject.getIsActive());

        SubjectMaster updatedSubject = subjectMasterRepository.save(existingSubject);
        log.info("Successfully updated subject with ID: {}", updatedSubject.getId());
        
        return convertToDTO(updatedSubject);
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectMasterDTO getSubjectById(Long id) {
        log.debug("Fetching subject by ID: {}", id);
        
        SubjectMaster subjectMaster = subjectMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + id));
        
        return convertToDTO(subjectMaster);
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectMasterDTO getSubjectByCode(String subjectCode) {
        log.debug("Fetching subject by code: {}", subjectCode);
        
        SubjectMaster subjectMaster = subjectMasterRepository.findBySubjectCode(subjectCode.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with code: " + subjectCode));
        
        return convertToDTO(subjectMaster);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectMasterDTO> getAllActiveSubjects() {
        log.debug("Fetching all active subjects");
        
        List<SubjectMaster> subjects = subjectMasterRepository.findByIsActiveTrue();
        return subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SubjectMasterDTO> getAllActiveSubjects(Pageable pageable) {
        log.debug("Fetching active subjects with pagination: {}", pageable);
        
        Page<SubjectMaster> subjects = subjectMasterRepository.findByIsActiveTrue(pageable);
        return subjects.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectMasterDTO> getSubjectsByType(SubjectType subjectType) {
        log.debug("Fetching subjects by type: {}", subjectType);
        
        List<SubjectMaster> subjects = subjectMasterRepository.findBySubjectTypeAndIsActiveTrue(subjectType);
        return subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SubjectMasterDTO> searchSubjects(String searchTerm, Boolean isActive, SubjectType subjectType, Pageable pageable) {
        log.debug("Searching subjects with term: {}, active: {}, type: {}", searchTerm, isActive, subjectType);
        
        if (!StringUtils.hasText(searchTerm) && subjectType == null) {
            if (isActive != null && isActive) {
                return getAllActiveSubjects(pageable);
            } else {
                Page<SubjectMaster> subjects = subjectMasterRepository.findAll(pageable);
                return subjects.map(this::convertToDTO);
            }
        }
        
        Page<SubjectMaster> subjects = subjectMasterRepository.searchByNameOrCodeAndType(
                searchTerm != null ? searchTerm.trim() : null, 
                isActive != null ? isActive : true, 
                subjectType, 
                pageable);
        return subjects.map(this::convertToDTO);
    }

    @Override
    public void deleteSubject(Long id) {
        log.info("Deleting subject with ID: {}", id);
        
        SubjectMaster subjectMaster = subjectMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + id));
        
        // Check if subject is in use
        List<SubjectMaster> subjectsInUse = subjectMasterRepository.findSubjectsInUse();
        boolean isInUse = subjectsInUse.stream().anyMatch(s -> s.getId().equals(id));
        
        if (isInUse) {
            throw new IllegalStateException("Cannot delete subject that is currently in use in configurations");
        }
        
        subjectMaster.setIsActive(false);
        subjectMasterRepository.save(subjectMaster);
        
        log.info("Successfully soft deleted subject with ID: {}", id);
    }

    @Override
    public SubjectMasterDTO updateSubjectStatus(Long id, Boolean isActive) {
        log.info("Updating subject status for ID: {} to {}", id, isActive);
        
        SubjectMaster subjectMaster = subjectMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + id));
        
        // If deactivating, check if subject is in use
        if (Boolean.FALSE.equals(isActive)) {
            List<SubjectMaster> subjectsInUse = subjectMasterRepository.findSubjectsInUse();
            boolean isInUse = subjectsInUse.stream().anyMatch(s -> s.getId().equals(id));
            
            if (isInUse) {
                throw new IllegalStateException("Cannot deactivate subject that is currently in use in configurations");
            }
        }
        
        subjectMaster.setIsActive(isActive);
        SubjectMaster updatedSubject = subjectMasterRepository.save(subjectMaster);
        
        log.info("Successfully updated subject status for ID: {}", id);
        return convertToDTO(updatedSubject);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCode(String subjectCode) {
        return subjectMasterRepository.existsBySubjectCode(subjectCode.trim().toUpperCase());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String subjectName) {
        return subjectMasterRepository.existsBySubjectNameIgnoreCaseAndIsActiveTrue(subjectName.trim());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectMasterDTO> getSubjectsInUse() {
        log.debug("Fetching subjects that are currently in use");
        
        List<SubjectMaster> subjects = subjectMasterRepository.findSubjectsInUse();
        return subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectMasterDTO> getSubjectsNotInUse() {
        log.debug("Fetching subjects that are not currently in use");
        
        List<SubjectMaster> subjects = subjectMasterRepository.findSubjectsNotInUse();
        return subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectMasterDTO> getSubjectsWithConfigurationCount() {
        log.debug("Fetching subjects with configuration count");
        
        List<Object[]> results = subjectMasterRepository.findSubjectsWithConfigurationCount();
        return results.stream()
                .map(result -> {
                    SubjectMaster subject = (SubjectMaster) result[0];
                    Long configCount = (Long) result[1];
                    SubjectMasterDTO dto = convertToDTO(subject);
                    dto.setConfigurationCount(configCount);
                    dto.setIsInUse(configCount > 0);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void validateSubjectRequest(SubjectMasterRequest request, Long excludeId) {
        if (request == null) {
            throw new IllegalArgumentException("Subject request cannot be null");
        }
        
        if (!StringUtils.hasText(request.getSubjectCode())) {
            throw new IllegalArgumentException("Subject code is required");
        }
        
        if (!StringUtils.hasText(request.getSubjectName())) {
            throw new IllegalArgumentException("Subject name is required");
        }
        
        if (request.getSubjectType() == null) {
            throw new IllegalArgumentException("Subject type is required");
        }
        
        String subjectCode = request.getSubjectCode().trim().toUpperCase();
        String subjectName = request.getSubjectName().trim();
        
        // Check for duplicate subject code
        if (excludeId != null) {
            if (subjectMasterRepository.existsBySubjectCodeAndIdNot(subjectCode, excludeId)) {
                throw new IllegalArgumentException("Subject code already exists: " + subjectCode);
            }
        } else {
            if (subjectMasterRepository.existsBySubjectCode(subjectCode)) {
                throw new IllegalArgumentException("Subject code already exists: " + subjectCode);
            }
        }
        
        // Check for duplicate subject name among active subjects
        if (excludeId != null) {
            if (subjectMasterRepository.existsBySubjectNameIgnoreCaseAndIsActiveTrueAndIdNot(subjectName, excludeId)) {
                throw new IllegalArgumentException("Subject name already exists among active subjects: " + subjectName);
            }
        } else {
            if (subjectMasterRepository.existsBySubjectNameIgnoreCaseAndIsActiveTrue(subjectName)) {
                throw new IllegalArgumentException("Subject name already exists among active subjects: " + subjectName);
            }
        }
    }

    /**
     * Convert SubjectMaster entity to DTO
     */
    private SubjectMasterDTO convertToDTO(SubjectMaster subjectMaster) {
        return SubjectMasterDTO.builder()
                .id(subjectMaster.getId())
                .subjectCode(subjectMaster.getSubjectCode())
                .subjectName(subjectMaster.getSubjectName())
                .description(subjectMaster.getDescription())
                .subjectType(subjectMaster.getSubjectType())
                .isActive(subjectMaster.getIsActive())
                .createdAt(subjectMaster.getCreatedAt())
                .updatedAt(subjectMaster.getUpdatedAt())
                .build();
    }
}
