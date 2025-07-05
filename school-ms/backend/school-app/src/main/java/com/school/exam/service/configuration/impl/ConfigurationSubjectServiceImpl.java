package com.school.exam.service.configuration.impl;

import com.school.exam.dto.configuration.ConfigurationSubjectDTO;
import com.school.exam.dto.configuration.ConfigurationSubjectRequest;
import com.school.exam.model.configuration.ClassConfiguration;
import com.school.exam.model.configuration.ConfigurationSubject;
import com.school.exam.model.configuration.SubjectMaster;
import com.school.exam.model.configuration.SubjectType;
import com.school.exam.repository.configuration.ClassConfigurationRepository;
import com.school.exam.repository.configuration.ConfigurationSubjectRepository;
import com.school.exam.repository.configuration.SubjectMasterRepository;
import com.school.exam.service.configuration.ConfigurationSubjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ConfigurationSubjectService for managing configuration subject operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConfigurationSubjectServiceImpl implements ConfigurationSubjectService {

    private final ConfigurationSubjectRepository configurationSubjectRepository;
    private final ClassConfigurationRepository classConfigurationRepository;
    private final SubjectMasterRepository subjectMasterRepository;

    @Override
    public ConfigurationSubjectDTO createConfigurationSubject(ConfigurationSubjectRequest request) {
        log.info("Creating new configuration subject for class: {}, subject: {}", 
                request.getClassConfigurationId(), request.getSubjectMasterId());
        
        validateConfigurationSubjectRequest(request, null);
        
        ClassConfiguration classConfiguration = classConfigurationRepository.findById(request.getClassConfigurationId())
                .orElseThrow(() -> new IllegalArgumentException("Class configuration not found with ID: " + request.getClassConfigurationId()));
        
        SubjectMaster subjectMaster = subjectMasterRepository.findById(request.getSubjectMasterId())
                .orElseThrow(() -> new IllegalArgumentException("Subject master not found with ID: " + request.getSubjectMasterId()));
        
        ConfigurationSubject configurationSubject = ConfigurationSubject.builder()
                .classConfiguration(classConfiguration)
                .subjectMaster(subjectMaster)
                .totalMarks(request.getTotalMarks())
                .passingMarks(request.getPassingMarks())
                .theoryMarks(request.getTheoryMarks())
                .practicalMarks(request.getPracticalMarks())
                .theoryPassingMarks(request.getTheoryPassingMarks())
                .practicalPassingMarks(request.getPracticalPassingMarks())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        ConfigurationSubject savedConfigurationSubject = configurationSubjectRepository.save(configurationSubject);
        log.info("Successfully created configuration subject with ID: {}", savedConfigurationSubject.getId());
        
        return convertToDTO(savedConfigurationSubject);
    }

    @Override
    public ConfigurationSubjectDTO updateConfigurationSubject(Long id, ConfigurationSubjectRequest request) {
        log.info("Updating configuration subject with ID: {}", id);
        
        ConfigurationSubject existingConfigurationSubject = configurationSubjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuration subject not found with ID: " + id));
        
        // Create a temporary request with the existing IDs for validation
        ConfigurationSubjectRequest validationRequest = ConfigurationSubjectRequest.builder()
                .classConfigurationId(existingConfigurationSubject.getClassConfiguration().getId())
                .subjectMasterId(existingConfigurationSubject.getSubjectMaster().getId())
                .totalMarks(request.getTotalMarks())
                .passingMarks(request.getPassingMarks())
                .theoryMarks(request.getTheoryMarks())
                .practicalMarks(request.getPracticalMarks())
                .theoryPassingMarks(request.getTheoryPassingMarks())
                .practicalPassingMarks(request.getPracticalPassingMarks())
                .isActive(request.getIsActive())
                .build();
        
        validateMarksDistribution(validationRequest);
        
        existingConfigurationSubject.setTotalMarks(request.getTotalMarks());
        existingConfigurationSubject.setPassingMarks(request.getPassingMarks());
        existingConfigurationSubject.setTheoryMarks(request.getTheoryMarks());
        existingConfigurationSubject.setPracticalMarks(request.getPracticalMarks());
        existingConfigurationSubject.setTheoryPassingMarks(request.getTheoryPassingMarks());
        existingConfigurationSubject.setPracticalPassingMarks(request.getPracticalPassingMarks());
        existingConfigurationSubject.setIsActive(request.getIsActive() != null ? request.getIsActive() : existingConfigurationSubject.getIsActive());

        ConfigurationSubject updatedConfigurationSubject = configurationSubjectRepository.save(existingConfigurationSubject);
        log.info("Successfully updated configuration subject with ID: {}", updatedConfigurationSubject.getId());
        
        return convertToDTO(updatedConfigurationSubject);
    }

    @Override
    @Transactional(readOnly = true)
    public ConfigurationSubjectDTO getConfigurationSubjectById(Long id) {
        log.debug("Fetching configuration subject by ID: {}", id);
        
        ConfigurationSubject configurationSubject = configurationSubjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuration subject not found with ID: " + id));
        
        return convertToDTO(configurationSubject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> getSubjectsByClassConfiguration(Long classConfigurationId) {
        log.debug("Fetching subjects for class configuration ID: {}", classConfigurationId);
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository
                .findByClassConfigurationId(classConfigurationId);
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> getActiveSubjectsByClassConfiguration(Long classConfigurationId) {
        log.debug("Fetching active subjects for class configuration ID: {}", classConfigurationId);
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository
                .findByClassConfigurationIdAndIsActiveTrue(classConfigurationId);
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> getConfigurationsBySubjectMaster(Long subjectMasterId) {
        log.debug("Fetching configurations for subject master ID: {}", subjectMasterId);
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository
                .findBySubjectMasterIdAndIsActiveTrue(subjectMasterId);
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> getConfigurationsBySubjectType(SubjectType subjectType) {
        log.debug("Fetching configurations by subject type: {}", subjectType);
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository
                .findBySubjectType(subjectType);
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> getConfigurationsByAcademicYear(String academicYear) {
        log.debug("Fetching configurations by academic year: {}", academicYear);
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository
                .findByAcademicYear(academicYear);
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConfigurationSubjectDTO> searchConfigurationsBySubjectName(String searchTerm, Pageable pageable) {
        log.debug("Searching configurations by subject name: {}", searchTerm);
        
        Page<ConfigurationSubject> configurationSubjects = configurationSubjectRepository
                .searchBySubjectName(searchTerm, pageable);
        return configurationSubjects.map(this::convertToDTO);
    }

    @Override
    public void deleteConfigurationSubject(Long id) {
        log.info("Deleting configuration subject with ID: {}", id);
        
        ConfigurationSubject configurationSubject = configurationSubjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuration subject not found with ID: " + id));
        
        configurationSubject.setIsActive(false);
        configurationSubjectRepository.save(configurationSubject);
        
        log.info("Successfully soft deleted configuration subject with ID: {}", id);
    }

    @Override
    public void deleteSubjectsByConfigurationId(Long classConfigurationId) {
        log.info("Deleting all subjects for class configuration ID: {}", classConfigurationId);
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository
                .findByClassConfigurationId(classConfigurationId);
        
        configurationSubjects.forEach(cs -> cs.setIsActive(false));
        configurationSubjectRepository.saveAll(configurationSubjects);
        
        log.info("Successfully soft deleted {} subjects for class configuration ID: {}", 
                configurationSubjects.size(), classConfigurationId);
    }

    @Override
    public ConfigurationSubjectDTO updateConfigurationSubjectStatus(Long id, Boolean isActive) {
        log.info("Updating configuration subject status for ID: {} to {}", id, isActive);
        
        ConfigurationSubject configurationSubject = configurationSubjectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuration subject not found with ID: " + id));
        
        configurationSubject.setIsActive(isActive);
        ConfigurationSubject updatedConfigurationSubject = configurationSubjectRepository.save(configurationSubject);
        
        log.info("Successfully updated configuration subject status for ID: {}", id);
        return convertToDTO(updatedConfigurationSubject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> getSubjectsWithTheory() {
        log.debug("Fetching subjects with theory component");
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository.findSubjectsWithTheory();
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> getSubjectsWithPractical() {
        log.debug("Fetching subjects with practical component");
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository.findSubjectsWithPractical();
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> getConfigurationsByMarksRange(Integer minMarks, Integer maxMarks) {
        log.debug("Fetching configurations by marks range: {} - {}", minMarks, maxMarks);
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository
                .findByMarksRange(minMarks, maxMarks);
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getTotalMarksByClassConfiguration(Long classConfigurationId) {
        log.debug("Calculating total marks for class configuration ID: {}", classConfigurationId);
        
        Integer totalMarks = configurationSubjectRepository.getTotalMarksByClassConfigurationId(classConfigurationId);
        return totalMarks != null ? totalMarks : 0;
    }

    @Override
    @Transactional(readOnly = true)
    public Long getSubjectCountByClassConfiguration(Long classConfigurationId) {
        log.debug("Counting subjects for class configuration ID: {}", classConfigurationId);
        
        return configurationSubjectRepository.getSubjectCountByClassConfigurationId(classConfigurationId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> getAllConfigurationsWithDetails() {
        log.debug("Fetching all configurations with details");
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository.findAllWithDetails();
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> findConfigurationsWithInvalidMarks() {
        log.debug("Finding configurations with invalid marks distribution");
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository.findWithInvalidMarksDistribution();
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigurationSubjectDTO> findDuplicateConfigurations() {
        log.debug("Finding duplicate configurations");
        
        List<ConfigurationSubject> configurationSubjects = configurationSubjectRepository.findDuplicateConfigurations();
        return configurationSubjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSubjectAlreadyConfigured(Long classConfigurationId, Long subjectMasterId) {
        return configurationSubjectRepository.existsByClassConfigurationIdAndSubjectMasterId(
                classConfigurationId, subjectMasterId);
    }

    @Override
    public void validateConfigurationSubjectRequest(ConfigurationSubjectRequest request, Long excludeId) {
        if (request == null) {
            throw new IllegalArgumentException("Configuration subject request cannot be null");
        }
        
        if (request.getClassConfigurationId() == null) {
            throw new IllegalArgumentException("Class configuration ID is required");
        }
        
        if (request.getSubjectMasterId() == null) {
            throw new IllegalArgumentException("Subject master ID is required");
        }
        
        if (request.getTotalMarks() == null || request.getTotalMarks() < 1) {
            throw new IllegalArgumentException("Total marks must be at least 1");
        }
        
        if (request.getPassingMarks() == null || request.getPassingMarks() < 1) {
            throw new IllegalArgumentException("Passing marks must be at least 1");
        }
        
        if (request.getPassingMarks() > request.getTotalMarks()) {
            throw new IllegalArgumentException("Passing marks cannot exceed total marks");
        }
        
        // Check for duplicate configuration
        if (excludeId != null) {
            if (configurationSubjectRepository.existsByClassConfigurationIdAndSubjectMasterIdAndIdNot(
                    request.getClassConfigurationId(), request.getSubjectMasterId(), excludeId)) {
                throw new IllegalArgumentException("Subject is already configured for this class");
            }
        } else {
            if (configurationSubjectRepository.existsByClassConfigurationIdAndSubjectMasterId(
                    request.getClassConfigurationId(), request.getSubjectMasterId())) {
                throw new IllegalArgumentException("Subject is already configured for this class");
            }
        }
        
        validateMarksDistribution(request);
    }

    @Override
    public void validateMarksDistribution(ConfigurationSubjectRequest request) {
        // Get subject master to validate marks distribution
        SubjectMaster subjectMaster = subjectMasterRepository.findById(request.getSubjectMasterId())
                .orElseThrow(() -> new IllegalArgumentException("Subject master not found"));
        
        SubjectType subjectType = subjectMaster.getSubjectType();
        
        switch (subjectType) {
            case THEORY:
                if (request.getTheoryMarks() == null || !request.getTheoryMarks().equals(request.getTotalMarks())) {
                    throw new IllegalArgumentException("Theory subjects must have theory marks equal to total marks");
                }
                if (request.getPracticalMarks() != null) {
                    throw new IllegalArgumentException("Theory subjects cannot have practical marks");
                }
                if (request.getTheoryPassingMarks() != null && request.getTheoryPassingMarks() > request.getTheoryMarks()) {
                    throw new IllegalArgumentException("Theory passing marks cannot exceed theory marks");
                }
                break;
                
            case PRACTICAL:
                if (request.getPracticalMarks() == null || !request.getPracticalMarks().equals(request.getTotalMarks())) {
                    throw new IllegalArgumentException("Practical subjects must have practical marks equal to total marks");
                }
                if (request.getTheoryMarks() != null) {
                    throw new IllegalArgumentException("Practical subjects cannot have theory marks");
                }
                if (request.getPracticalPassingMarks() != null && request.getPracticalPassingMarks() > request.getPracticalMarks()) {
                    throw new IllegalArgumentException("Practical passing marks cannot exceed practical marks");
                }
                break;
                
            case BOTH:
                if (request.getTheoryMarks() == null || request.getPracticalMarks() == null) {
                    throw new IllegalArgumentException("Both-type subjects must have both theory and practical marks");
                }
                if (!request.getTotalMarks().equals(request.getTheoryMarks() + request.getPracticalMarks())) {
                    throw new IllegalArgumentException("Theory marks + Practical marks must equal total marks");
                }
                if (request.getTheoryPassingMarks() != null && request.getTheoryPassingMarks() > request.getTheoryMarks()) {
                    throw new IllegalArgumentException("Theory passing marks cannot exceed theory marks");
                }
                if (request.getPracticalPassingMarks() != null && request.getPracticalPassingMarks() > request.getPracticalMarks()) {
                    throw new IllegalArgumentException("Practical passing marks cannot exceed practical marks");
                }
                break;
                
            default:
                throw new IllegalArgumentException("Invalid subject type: " + subjectType);
        }
    }

    /**
     * Convert ConfigurationSubject entity to DTO
     */
    private ConfigurationSubjectDTO convertToDTO(ConfigurationSubject configurationSubject) {
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
                .section(configurationSubject.getClassConfiguration().getSection())
                .academicYear(configurationSubject.getClassConfiguration().getAcademicYear())
                .build();
    }
}
