package com.school.exam.service.configuration;

import com.school.exam.dto.configuration.ClassConfigurationDTO;
import com.school.exam.dto.configuration.ClassConfigurationRequest;
import com.school.exam.dto.configuration.CopyConfigurationRequest;
import com.school.exam.dto.configuration.CopyConfigurationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing ClassConfiguration operations.
 * Provides business logic for class configuration management.
 */
public interface ClassConfigurationService {

    /**
     * Create a new class configuration
     * @param request Class configuration creation request
     * @return Created class configuration DTO
     * @throws IllegalArgumentException if configuration already exists or validation fails
     */
    ClassConfigurationDTO createConfiguration(ClassConfigurationRequest request);

    /**
     * Update an existing class configuration
     * @param id Configuration ID
     * @param request Class configuration update request
     * @return Updated class configuration DTO
     * @throws IllegalArgumentException if configuration not found or validation fails
     */
    ClassConfigurationDTO updateConfiguration(Long id, ClassConfigurationRequest request);

    /**
     * Get class configuration by ID
     * @param id Configuration ID
     * @return Class configuration DTO with subjects
     * @throws IllegalArgumentException if configuration not found
     */
    ClassConfigurationDTO getConfigurationById(Long id);

    /**
     * Get class configuration by class and academic year
     * @param className Class name
     * @param academicYear Academic year
     * @return Class configuration DTO
     * @throws IllegalArgumentException if configuration not found
     */
    ClassConfigurationDTO getConfigurationByDetails(String className, String academicYear);

    /**
     * Get all active configurations
     * @return List of active class configuration DTOs
     */
    List<ClassConfigurationDTO> getAllActiveConfigurations();

    /**
     * Get all active configurations with pagination
     * @param pageable Pagination information
     * @return Page of active class configuration DTOs
     */
    Page<ClassConfigurationDTO> getAllActiveConfigurations(Pageable pageable);

    /**
     * Get configurations by academic year
     * @param academicYear Academic year
     * @return List of class configuration DTOs
     */
    List<ClassConfigurationDTO> getConfigurationsByAcademicYear(String academicYear);

    /**
     * Get configurations by class name
     * @param className Class name
     * @return List of class configuration DTOs
     */
    List<ClassConfigurationDTO> getConfigurationsByClassName(String className);

    /**
     * Search configurations by class name
     * @param searchTerm Search term
     * @param isActive Filter by active status (null for all)
     * @param academicYear Academic year filter
     * @param pageable Pagination information
     * @return Page of matching class configuration DTOs
     */
    Page<ClassConfigurationDTO> searchConfigurations(String searchTerm, Boolean isActive, 
                                                    String academicYear, Pageable pageable);

    /**
     * Soft delete a class configuration
     * @param id Configuration ID
     * @throws IllegalArgumentException if configuration not found
     */
    void deleteConfiguration(Long id);

    /**
     * Activate/deactivate a class configuration
     * @param id Configuration ID
     * @param isActive New active status
     * @return Updated class configuration DTO
     * @throws IllegalArgumentException if configuration not found
     */
    ClassConfigurationDTO updateConfigurationStatus(Long id, Boolean isActive);

    /**
     * Copy configuration from one class to another
     * @param request Copy configuration request
     * @return Copy operation response with details
     * @throws IllegalArgumentException if validation fails
     */
    CopyConfigurationResponse copyConfiguration(CopyConfigurationRequest request);

    /**
     * Get configurations that can be copied (have subjects)
     * @return List of copyable configurations
     */
    List<ClassConfigurationDTO> getCopyableConfigurations();

    /**
     * Get similar configurations (same class name, different year)
     * @param className Class name
     * @param academicYear Academic year
     * @return List of similar configurations
     */
    List<ClassConfigurationDTO> getSimilarConfigurations(String className, String academicYear);

    /**
     * Get configurations with subject count
     * @param academicYear Academic year filter
     * @return List of configurations with subject count
     */
    List<ClassConfigurationDTO> getConfigurationsWithSubjectCount(String academicYear);

    /**
     * Get configurations without any subjects
     * @return List of configurations without subjects
     */
    List<ClassConfigurationDTO> getConfigurationsWithoutSubjects();

    /**
     * Get distinct academic years
     * @return List of academic years
     */
    List<String> getDistinctAcademicYears();

    /**
     * Get distinct class names for an academic year
     * @param academicYear Academic year
     * @return List of class names
     */
    List<String> getDistinctClassNames(String academicYear);

    /**
     * Check if a configuration exists
     * @param className Class name
     * @param academicYear Academic year
     * @return true if exists, false otherwise
     */
    boolean existsByDetails(String className, String academicYear);

    /**
     * Validate class configuration request
     * @param request Request to validate
     * @param excludeId ID to exclude from validation (for updates)
     * @throws IllegalArgumentException if validation fails
     */
    void validateConfigurationRequest(ClassConfigurationRequest request, Long excludeId);
}
