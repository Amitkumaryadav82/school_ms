package com.school.exam.service.configuration.impl;

import com.school.exam.dto.configuration.*;
import com.school.exam.model.configuration.ClassConfiguration;
import com.school.exam.model.configuration.ConfigurationSubject;
import com.school.exam.model.configuration.SubjectMaster;
import com.school.exam.repository.configuration.ClassConfigurationRepository;
import com.school.exam.repository.configuration.SubjectMasterRepository;
import com.school.exam.service.configuration.ClassConfigurationService;
import com.school.exam.service.configuration.ConfigurationSubjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ClassConfigurationService for managing class configuration operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ClassConfigurationServiceImpl implements ClassConfigurationService {

    private final ClassConfigurationRepository classConfigurationRepository;
    private final SubjectMasterRepository subjectMasterRepository;
    private final ConfigurationSubjectService configurationSubjectService;

    @Override
    public ClassConfigurationDTO createConfiguration(ClassConfigurationRequest request) {
        log.info("Creating new class configuration: {} ({})", 
                request.getClassName(), request.getAcademicYear());
        
        validateConfigurationRequest(request, null);
        
        ClassConfiguration configuration = ClassConfiguration.builder()
                .className(request.getClassName().trim())
                .academicYear(request.getAcademicYear().trim())
                .description(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .subjects(new ArrayList<>())
                .build();

        ClassConfiguration savedConfiguration = classConfigurationRepository.save(configuration);
        log.info("Successfully created class configuration with ID: {}", savedConfiguration.getId());
        
        return convertToDTO(savedConfiguration);
    }

    @Override
    public ClassConfigurationDTO updateConfiguration(Long id, ClassConfigurationRequest request) {
        log.info("Updating class configuration with ID: {}", id);
        
        ClassConfiguration existingConfiguration = classConfigurationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuration not found with ID: " + id));
        
        validateConfigurationRequest(request, id);
        
        existingConfiguration.setClassName(request.getClassName().trim());
        existingConfiguration.setAcademicYear(request.getAcademicYear().trim());
        existingConfiguration.setDescription(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null);
        existingConfiguration.setIsActive(request.getIsActive() != null ? request.getIsActive() : existingConfiguration.getIsActive());

        ClassConfiguration updatedConfiguration = classConfigurationRepository.save(existingConfiguration);
        log.info("Successfully updated class configuration with ID: {}", updatedConfiguration.getId());
        
        return convertToDTO(updatedConfiguration);
    }

    @Override
    @Transactional(readOnly = true)
    public ClassConfigurationDTO getConfigurationById(Long id) {
        log.debug("Fetching class configuration by ID: {}", id);
        
        ClassConfiguration configuration = classConfigurationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuration not found with ID: " + id));
        
        return convertToDTOWithSubjects(configuration);
    }

    @Override
    @Transactional(readOnly = true)
    public ClassConfigurationDTO getConfigurationByDetails(String className, String academicYear) {
        log.debug("Fetching configuration by details: {} ({})", className, academicYear);
        
        ClassConfiguration configuration = classConfigurationRepository
                .findByClassNameAndAcademicYear(className.trim(), academicYear.trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        String.format("Configuration not found: %s (%s)", className, academicYear)));
        
        return convertToDTOWithSubjects(configuration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassConfigurationDTO> getAllActiveConfigurations() {
        log.debug("Fetching all active configurations");
        
        List<ClassConfiguration> configurations = classConfigurationRepository.findByIsActiveTrue();
        return configurations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClassConfigurationDTO> getAllActiveConfigurations(Pageable pageable) {
        log.debug("Fetching active configurations with pagination: {}", pageable);
        
        Page<ClassConfiguration> configurations = classConfigurationRepository.findByIsActiveTrue(pageable);
        return configurations.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassConfigurationDTO> getConfigurationsByAcademicYear(String academicYear) {
        log.debug("Fetching configurations by academic year: {}", academicYear);
        
        List<ClassConfiguration> configurations = classConfigurationRepository
                .findByAcademicYearAndIsActiveTrue(academicYear.trim());
        return configurations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassConfigurationDTO> getConfigurationsByClassName(String className) {
        log.debug("Fetching configurations by class name: {}", className);
        
        List<ClassConfiguration> configurations = classConfigurationRepository
                .findByClassNameAndIsActiveTrue(className.trim());
        return configurations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClassConfigurationDTO> searchConfigurations(String searchTerm, Boolean isActive, 
                                                           String academicYear, Pageable pageable) {
        log.debug("Searching configurations with term: {}, active: {}, year: {}", searchTerm, isActive, academicYear);
        
        if (!StringUtils.hasText(searchTerm)) {
            if (StringUtils.hasText(academicYear)) {
                if (isActive != null && isActive) {
                    List<ClassConfiguration> configurations = classConfigurationRepository
                            .findByAcademicYearAndIsActiveTrue(academicYear.trim());
                    return Page.empty(pageable); // Convert to page properly
                } else {
                    List<ClassConfiguration> configurations = classConfigurationRepository
                            .findByAcademicYear(academicYear.trim());
                    return Page.empty(pageable); // Convert to page properly
                }
            } else {
                return getAllActiveConfigurations(pageable);
            }
        }
        
        Page<ClassConfiguration> configurations = classConfigurationRepository.searchByClass(
                searchTerm.trim(), isActive != null ? isActive : true, 
                academicYear != null ? academicYear.trim() : "", pageable);
        return configurations.map(this::convertToDTO);
    }

    @Override
    public void deleteConfiguration(Long id) {
        log.info("Deleting class configuration with ID: {}", id);
        
        ClassConfiguration configuration = classConfigurationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuration not found with ID: " + id));
        
        configuration.setIsActive(false);
        // Also deactivate all associated subjects
        configuration.getSubjects().forEach(subject -> subject.setIsActive(false));
        
        classConfigurationRepository.save(configuration);
        
        log.info("Successfully soft deleted class configuration with ID: {}", id);
    }

    @Override
    public ClassConfigurationDTO updateConfigurationStatus(Long id, Boolean isActive) {
        log.info("Updating configuration status for ID: {} to {}", id, isActive);
        
        ClassConfiguration configuration = classConfigurationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuration not found with ID: " + id));
        
        configuration.setIsActive(isActive);
        // If deactivating, also deactivate all subjects
        if (Boolean.FALSE.equals(isActive)) {
            configuration.getSubjects().forEach(subject -> subject.setIsActive(false));
        }
        
        ClassConfiguration updatedConfiguration = classConfigurationRepository.save(configuration);
        
        log.info("Successfully updated configuration status for ID: {}", id);
        return convertToDTO(updatedConfiguration);
    }

    @Override
    public CopyConfigurationResponse copyConfiguration(CopyConfigurationRequest request) {
        log.info("Copying configuration from ID: {} to {} ({})", 
                request.getSourceConfigurationId(), request.getTargetClassName(), 
                request.getTargetAcademicYear());
        
        // Validate request
        if (request.getSourceConfigurationId() == null) {
            throw new IllegalArgumentException("Source configuration ID is required");
        }
        
        // Check if target already exists
        boolean targetExists = existsByDetails(request.getTargetClassName(), 
                request.getTargetAcademicYear());
        
        if (targetExists && !Boolean.TRUE.equals(request.getOverwriteExisting())) {
            throw new IllegalArgumentException("Target configuration already exists");
        }
        
        // Get source configuration
        ClassConfiguration sourceConfig = classConfigurationRepository.findById(request.getSourceConfigurationId())
                .orElseThrow(() -> new IllegalArgumentException("Source configuration not found"));
        
        CopyConfigurationResponse.CopyConfigurationResponseBuilder responseBuilder = CopyConfigurationResponse.builder()
                .targetClassName(request.getTargetClassName())
                .targetAcademicYear(request.getTargetAcademicYear())
                .subjectResults(new ArrayList<>())
                .warnings(new ArrayList<>())
                .errors(new ArrayList<>())
                .success(false);
        
        try {
            // Create or update target configuration
            ClassConfiguration targetConfig;
            if (targetExists) {
                targetConfig = classConfigurationRepository
                        .findByClassNameAndAcademicYear(
                                request.getTargetClassName(), request.getTargetAcademicYear())
                        .orElseThrow();
                // Clear existing subjects if overwriting
                configurationSubjectService.deleteSubjectsByConfigurationId(targetConfig.getId());
            } else {
                ClassConfigurationRequest configRequest = ClassConfigurationRequest.builder()
                        .className(request.getTargetClassName())
                        .academicYear(request.getTargetAcademicYear())
                        .description(request.getDescription())
                        .isActive(true)
                        .build();
                
                ClassConfigurationDTO createdConfig = createConfiguration(configRequest);
                targetConfig = classConfigurationRepository.findById(createdConfig.getId()).orElseThrow();
            }
            
            responseBuilder.newConfigurationId(targetConfig.getId());
            
            // Copy subjects
            int copiedCount = 0;
            int skippedCount = 0;
            
            for (ConfigurationSubject sourceSubject : sourceConfig.getSubjects()) {
                if (!sourceSubject.getIsActive()) {
                    continue; // Skip inactive subjects
                }
                
                try {
                    // Check if we should include this subject
                    boolean includeSubject = Boolean.TRUE.equals(request.getCopyAllSubjects());
                    
                    if (request.getSubjectConfigurations() != null) {
                        CopyConfigurationRequest.CopySubjectConfiguration subjectConfig = 
                                request.getSubjectConfigurations().stream()
                                        .filter(sc -> sc.getSubjectMasterId().equals(sourceSubject.getSubjectMaster().getId()))
                                        .findFirst()
                                        .orElse(null);
                        
                        if (subjectConfig != null) {
                            includeSubject = Boolean.TRUE.equals(subjectConfig.getInclude());
                        }
                    }
                    
                    if (includeSubject) {
                        ConfigurationSubjectRequest subjectRequest = ConfigurationSubjectRequest.builder()
                                .classConfigurationId(targetConfig.getId())
                                .subjectMasterId(sourceSubject.getSubjectMaster().getId())
                                .totalMarks(sourceSubject.getTotalMarks())
                                .passingMarks(sourceSubject.getPassingMarks())
                                .theoryMarks(sourceSubject.getTheoryMarks())
                                .practicalMarks(sourceSubject.getPracticalMarks())
                                .theoryPassingMarks(sourceSubject.getTheoryPassingMarks())
                                .practicalPassingMarks(sourceSubject.getPracticalPassingMarks())
                                .isActive(true)
                                .build();
                        
                        // Apply custom marks if specified
                        if (request.getSubjectConfigurations() != null) {
                            request.getSubjectConfigurations().stream()
                                    .filter(sc -> sc.getSubjectMasterId().equals(sourceSubject.getSubjectMaster().getId()))
                                    .findFirst()
                                    .ifPresent(sc -> {
                                        if (sc.getNewTotalMarks() != null) subjectRequest.setTotalMarks(sc.getNewTotalMarks());
                                        if (sc.getNewPassingMarks() != null) subjectRequest.setPassingMarks(sc.getNewPassingMarks());
                                        if (sc.getNewTheoryMarks() != null) subjectRequest.setTheoryMarks(sc.getNewTheoryMarks());
                                        if (sc.getNewPracticalMarks() != null) subjectRequest.setPracticalMarks(sc.getNewPracticalMarks());
                                        if (sc.getNewTheoryPassingMarks() != null) subjectRequest.setTheoryPassingMarks(sc.getNewTheoryPassingMarks());
                                        if (sc.getNewPracticalPassingMarks() != null) subjectRequest.setPracticalPassingMarks(sc.getNewPracticalPassingMarks());
                                    });
                        }
                        
                        ConfigurationSubjectDTO createdSubject = configurationSubjectService.createConfigurationSubject(subjectRequest);
                        
                        responseBuilder.subjectResults(new ArrayList<>(responseBuilder.build().getSubjectResults()));
                        responseBuilder.build().getSubjectResults().add(
                                CopyConfigurationResponse.CopySubjectResult.builder()
                                        .subjectMasterId(sourceSubject.getSubjectMaster().getId())
                                        .subjectName(sourceSubject.getSubjectMaster().getSubjectName())
                                        .subjectCode(sourceSubject.getSubjectMaster().getSubjectCode())
                                        .copied(true)
                                        .reason("Successfully copied")
                                        .newConfigurationSubjectId(createdSubject.getId())
                                        .build()
                        );
                        
                        copiedCount++;
                    } else {
                        responseBuilder.subjectResults(new ArrayList<>(responseBuilder.build().getSubjectResults()));
                        responseBuilder.build().getSubjectResults().add(
                                CopyConfigurationResponse.CopySubjectResult.builder()
                                        .subjectMasterId(sourceSubject.getSubjectMaster().getId())
                                        .subjectName(sourceSubject.getSubjectMaster().getSubjectName())
                                        .subjectCode(sourceSubject.getSubjectMaster().getSubjectCode())
                                        .copied(false)
                                        .reason("Excluded by configuration")
                                        .build()
                        );
                        
                        skippedCount++;
                    }
                } catch (Exception e) {
                    log.warn("Failed to copy subject {}: {}", 
                            sourceSubject.getSubjectMaster().getSubjectName(), e.getMessage());
                    
                    responseBuilder.subjectResults(new ArrayList<>(responseBuilder.build().getSubjectResults()));
                    responseBuilder.build().getSubjectResults().add(
                            CopyConfigurationResponse.CopySubjectResult.builder()
                                    .subjectMasterId(sourceSubject.getSubjectMaster().getId())
                                    .subjectName(sourceSubject.getSubjectMaster().getSubjectName())
                                    .subjectCode(sourceSubject.getSubjectMaster().getSubjectCode())
                                    .copied(false)
                                    .reason("Error: " + e.getMessage())
                                    .build()
                    );
                    
                    skippedCount++;
                }
            }
            
            responseBuilder
                    .copiedSubjectsCount(copiedCount)
                    .skippedSubjectsCount(skippedCount)
                    .success(true)
                    .message("Configuration copied successfully");
            
        } catch (Exception e) {
            log.error("Failed to copy configuration: {}", e.getMessage(), e);
            responseBuilder
                    .success(false)
                    .message("Failed to copy configuration: " + e.getMessage());
            responseBuilder.build().getErrors().add(e.getMessage());
        }
        
        CopyConfigurationResponse response = responseBuilder.build();
        log.info("Copy operation completed: {} subjects copied, {} skipped", 
                response.getCopiedSubjectsCount(), response.getSkippedSubjectsCount());
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassConfigurationDTO> getCopyableConfigurations() {
        log.debug("Fetching copyable configurations");
        
        List<ClassConfiguration> configurations = classConfigurationRepository.findCopyableConfigurations();
        return configurations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassConfigurationDTO> getSimilarConfigurations(String className, String academicYear) {
        log.debug("Fetching similar configurations for: {} ({})", className, academicYear);
        
        List<ClassConfiguration> configurations = classConfigurationRepository
                .findSimilarConfigurations(className.trim(), academicYear.trim());
        return configurations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassConfigurationDTO> getConfigurationsWithSubjectCount(String academicYear) {
        log.debug("Fetching configurations with subject count for year: {}", academicYear);
        
        List<Object[]> results = classConfigurationRepository.findConfigurationsWithSubjectCount(academicYear);
        return results.stream()
                .map(result -> {
                    ClassConfiguration config = (ClassConfiguration) result[0];
                    Long subjectCount = (Long) result[1];
                    ClassConfigurationDTO dto = convertToDTO(config);
                    dto.setSubjectCount(subjectCount.intValue());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassConfigurationDTO> getConfigurationsWithoutSubjects() {
        log.debug("Fetching configurations without subjects");
        
        List<ClassConfiguration> configurations = classConfigurationRepository.findConfigurationsWithoutSubjects();
        return configurations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctAcademicYears() {
        return classConfigurationRepository.findDistinctAcademicYears();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctClassNames(String academicYear) {
        return classConfigurationRepository.findDistinctClassNamesByAcademicYear(academicYear);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByDetails(String className, String academicYear) {
        return classConfigurationRepository.existsByClassNameAndAcademicYear(
                className.trim(), academicYear.trim());
    }

    @Override
    public void validateConfigurationRequest(ClassConfigurationRequest request, Long excludeId) {
        if (request == null) {
            throw new IllegalArgumentException("Configuration request cannot be null");
        }
        
        if (!StringUtils.hasText(request.getClassName())) {
            throw new IllegalArgumentException("Class name is required");
        }
        if (!StringUtils.hasText(request.getAcademicYear())) {
            throw new IllegalArgumentException("Academic year is required");
        }
        
        // Validate academic year format
        if (!request.getAcademicYear().matches("\\d{4}-\\d{2}")) {
            throw new IllegalArgumentException("Academic year must be in format YYYY-YY (e.g., 2023-24)");
        }
        
        String className = request.getClassName().trim();
        String academicYear = request.getAcademicYear().trim();
        
        // Check for duplicate configuration
        if (excludeId != null) {
            if (classConfigurationRepository.existsByClassNameAndAcademicYearAndIdNot(
                    className, academicYear, excludeId)) {
                throw new IllegalArgumentException(
                        String.format("Configuration already exists: %s (%s)", className, academicYear));
            }
        } else {
            if (classConfigurationRepository.existsByClassNameAndAcademicYear(
                    className, academicYear)) {
                throw new IllegalArgumentException(
                        String.format("Configuration already exists: %s (%s)", className, academicYear));
            }
        }
    }

    /**
     * Convert ClassConfiguration entity to DTO
     */
    private ClassConfigurationDTO convertToDTO(ClassConfiguration configuration) {
        return ClassConfigurationDTO.builder()
                .id(configuration.getId())
                .className(configuration.getClassName())
                .academicYear(configuration.getAcademicYear())
                .description(configuration.getDescription())
                .isActive(configuration.getIsActive())
                .createdAt(configuration.getCreatedAt())
                .updatedAt(configuration.getUpdatedAt())
                .subjectCount(configuration.getActiveSubjectCount())
                .totalMarks(configuration.getTotalMarksAcrossSubjects())
                .build();
    }

    /**
     * Convert ClassConfiguration entity to DTO with subjects
     */
    private ClassConfigurationDTO convertToDTOWithSubjects(ClassConfiguration configuration) {
        ClassConfigurationDTO dto = convertToDTO(configuration);
        
        if (configuration.getSubjects() != null) {
            List<ConfigurationSubjectDTO> subjectDTOs = configuration.getSubjects().stream()
                    .filter(cs -> Boolean.TRUE.equals(cs.getIsActive()))
                    .map(this::convertSubjectToDTO)
                    .collect(Collectors.toList());
            dto.setSubjects(subjectDTOs);
        }
        
        return dto;
    }

    /**
     * Convert ConfigurationSubject to DTO (simplified version)
     */
    private ConfigurationSubjectDTO convertSubjectToDTO(ConfigurationSubject configurationSubject) {
        return ConfigurationSubjectDTO.builder()
                .id(configurationSubject.getId())
                .classConfigurationId(configurationSubject.getClassConfiguration().getId())
                .subjectMasterId(configurationSubject.getSubjectMaster().getId())
                .subjectCode(configurationSubject.getSubjectMaster().getSubjectCode())
                .subjectName(configurationSubject.getSubjectMaster().getSubjectName())
                .subjectType(configurationSubject.getSubjectMaster().getSubjectType())
                .totalMarks(configurationSubject.getTotalMarks())
                .passingMarks(configurationSubject.getPassingMarks())
                .theoryMarks(configurationSubject.getTheoryMarks())
                .practicalMarks(configurationSubject.getPracticalMarks())
                .theoryPassingMarks(configurationSubject.getTheoryPassingMarks())
                .practicalPassingMarks(configurationSubject.getPracticalPassingMarks())
                .isActive(configurationSubject.getIsActive())
                .createdAt(configurationSubject.getCreatedAt())
                .updatedAt(configurationSubject.getUpdatedAt())
                .className(configurationSubject.getClassConfiguration().getClassName())
                .academicYear(configurationSubject.getClassConfiguration().getAcademicYear())
                .build();
    }
}
