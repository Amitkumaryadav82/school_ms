package com.school.exam.service.configuration;

import com.school.exam.dto.configuration.ConfigurationSubjectDTO;
import com.school.exam.dto.configuration.ConfigurationSubjectRequest;
import com.school.exam.model.configuration.SubjectType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing ConfigurationSubject operations.
 * Provides business logic for subject-class configuration management.
 */
public interface ConfigurationSubjectService {

    /**
     * Create a new configuration subject
     * @param request Configuration subject creation request
     * @return Created configuration subject DTO
     * @throws IllegalArgumentException if subject already configured for class or validation fails
     */
    ConfigurationSubjectDTO createConfigurationSubject(ConfigurationSubjectRequest request);

    /**
     * Update an existing configuration subject
     * @param id Configuration subject ID
     * @param request Configuration subject update request
     * @return Updated configuration subject DTO
     * @throws IllegalArgumentException if configuration subject not found or validation fails
     */
    ConfigurationSubjectDTO updateConfigurationSubject(Long id, ConfigurationSubjectRequest request);

    /**
     * Get configuration subject by ID
     * @param id Configuration subject ID
     * @return Configuration subject DTO
     * @throws IllegalArgumentException if configuration subject not found
     */
    ConfigurationSubjectDTO getConfigurationSubjectById(Long id);

    /**
     * Get configuration subjects for a class configuration
     * @param classConfigurationId Class configuration ID
     * @return List of configuration subject DTOs
     */
    List<ConfigurationSubjectDTO> getSubjectsByClassConfiguration(Long classConfigurationId);

    /**
     * Get active configuration subjects for a class configuration
     * @param classConfigurationId Class configuration ID
     * @return List of active configuration subject DTOs
     */
    List<ConfigurationSubjectDTO> getActiveSubjectsByClassConfiguration(Long classConfigurationId);

    /**
     * Get configurations for a subject master
     * @param subjectMasterId Subject master ID
     * @return List of configuration subject DTOs
     */
    List<ConfigurationSubjectDTO> getConfigurationsBySubjectMaster(Long subjectMasterId);

    /**
     * Get configuration subjects by subject type
     * @param subjectType Subject type
     * @return List of configuration subject DTOs
     */
    List<ConfigurationSubjectDTO> getConfigurationsBySubjectType(SubjectType subjectType);

    /**
     * Get configuration subjects by academic year
     * @param academicYear Academic year
     * @return List of configuration subject DTOs
     */
    List<ConfigurationSubjectDTO> getConfigurationsByAcademicYear(String academicYear);

    /**
     * Search configuration subjects by subject name
     * @param searchTerm Search term
     * @param pageable Pagination information
     * @return Page of matching configuration subject DTOs
     */
    Page<ConfigurationSubjectDTO> searchConfigurationsBySubjectName(String searchTerm, Pageable pageable);

    /**
     * Delete a configuration subject
     * @param id Configuration subject ID
     * @throws IllegalArgumentException if configuration subject not found
     */
    void deleteConfigurationSubject(Long id);

    /**
     * Delete all configuration subjects for a class configuration
     * @param classConfigurationId Class configuration ID
     */
    void deleteSubjectsByConfigurationId(Long classConfigurationId);

    /**
     * Update configuration subject status
     * @param id Configuration subject ID
     * @param isActive New active status
     * @return Updated configuration subject DTO
     * @throws IllegalArgumentException if configuration subject not found
     */
    ConfigurationSubjectDTO updateConfigurationSubjectStatus(Long id, Boolean isActive);

    /**
     * Get subjects with theory component
     * @return List of configuration subjects with theory
     */
    List<ConfigurationSubjectDTO> getSubjectsWithTheory();

    /**
     * Get subjects with practical component
     * @return List of configuration subjects with practical
     */
    List<ConfigurationSubjectDTO> getSubjectsWithPractical();

    /**
     * Get configuration subjects by marks range
     * @param minMarks Minimum marks
     * @param maxMarks Maximum marks
     * @return List of configuration subjects in marks range
     */
    List<ConfigurationSubjectDTO> getConfigurationsByMarksRange(Integer minMarks, Integer maxMarks);

    /**
     * Get total marks for a class configuration
     * @param classConfigurationId Class configuration ID
     * @return Total marks across all subjects
     */
    Integer getTotalMarksByClassConfiguration(Long classConfigurationId);

    /**
     * Get subject count for a class configuration
     * @param classConfigurationId Class configuration ID
     * @return Number of active subjects
     */
    Long getSubjectCountByClassConfiguration(Long classConfigurationId);

    /**
     * Get all configuration subjects with details
     * @return List of all configuration subjects with full details
     */
    List<ConfigurationSubjectDTO> getAllConfigurationsWithDetails();

    /**
     * Find configuration subjects with invalid marks distribution
     * @return List of configuration subjects with invalid marks
     */
    List<ConfigurationSubjectDTO> findConfigurationsWithInvalidMarks();

    /**
     * Find duplicate configurations (same subject in same class)
     * @return List of duplicate configuration subjects
     */
    List<ConfigurationSubjectDTO> findDuplicateConfigurations();

    /**
     * Check if a subject is already configured for a class
     * @param classConfigurationId Class configuration ID
     * @param subjectMasterId Subject master ID
     * @return true if already configured, false otherwise
     */
    boolean isSubjectAlreadyConfigured(Long classConfigurationId, Long subjectMasterId);

    /**
     * Validate configuration subject request
     * @param request Request to validate
     * @param excludeId ID to exclude from validation (for updates)
     * @throws IllegalArgumentException if validation fails
     */
    void validateConfigurationSubjectRequest(ConfigurationSubjectRequest request, Long excludeId);

    /**
     * Validate marks distribution for subject type
     * @param request Configuration subject request
     * @throws IllegalArgumentException if marks distribution is invalid
     */
    void validateMarksDistribution(ConfigurationSubjectRequest request);

    /**
     * Get configuration subjects that can be copied from source class to target class
     * @param sourceClassConfigId Source class configuration ID
     * @param targetClassConfigId Target class configuration ID
     * @return List of configuration subjects that can be copied
     */
    List<ConfigurationSubjectDTO> getCopyPreview(Long sourceClassConfigId, Long targetClassConfigId);

    /**
     * Copy configuration subjects from source class to target class
     * @param sourceClassConfigId Source class configuration ID
     * @param targetClassConfigId Target class configuration ID
     * @param subjectIds List of subject IDs to copy (null to copy all)
     * @param overwriteExisting Whether to overwrite existing configurations
     * @return List of copied configuration subjects
     */
    List<ConfigurationSubjectDTO> copyConfiguration(Long sourceClassConfigId, Long targetClassConfigId, 
                                                   List<Long> subjectIds, boolean overwriteExisting);
}
