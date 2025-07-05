package com.school.exam.service.configuration;

import com.school.exam.dto.configuration.SubjectMasterDTO;
import com.school.exam.dto.configuration.SubjectMasterRequest;
import com.school.exam.model.configuration.SubjectType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing SubjectMaster operations.
 * Provides business logic for subject master management.
 */
public interface SubjectMasterService {

    /**
     * Create a new subject master
     * @param request Subject master creation request
     * @return Created subject master DTO
     * @throws IllegalArgumentException if subject code or name already exists
     */
    SubjectMasterDTO createSubject(SubjectMasterRequest request);

    /**
     * Update an existing subject master
     * @param id Subject master ID
     * @param request Subject master update request
     * @return Updated subject master DTO
     * @throws IllegalArgumentException if subject not found or validation fails
     */
    SubjectMasterDTO updateSubject(Long id, SubjectMasterRequest request);

    /**
     * Get subject master by ID
     * @param id Subject master ID
     * @return Subject master DTO
     * @throws IllegalArgumentException if subject not found
     */
    SubjectMasterDTO getSubjectById(Long id);

    /**
     * Get subject master by code
     * @param subjectCode Subject code
     * @return Subject master DTO
     * @throws IllegalArgumentException if subject not found
     */
    SubjectMasterDTO getSubjectByCode(String subjectCode);

    /**
     * Get all active subjects
     * @return List of active subject master DTOs
     */
    List<SubjectMasterDTO> getAllActiveSubjects();

    /**
     * Get all active subjects with pagination
     * @param pageable Pagination information
     * @return Page of active subject master DTOs
     */
    Page<SubjectMasterDTO> getAllActiveSubjects(Pageable pageable);

    /**
     * Get subjects by type
     * @param subjectType Subject type
     * @return List of subject master DTOs
     */
    List<SubjectMasterDTO> getSubjectsByType(SubjectType subjectType);

    /**
     * Search subjects by name or code
     * @param searchTerm Search term
     * @param isActive Filter by active status (null for all)
     * @param subjectType Filter by subject type (null for all)
     * @param pageable Pagination information
     * @return Page of matching subject master DTOs
     */
    Page<SubjectMasterDTO> searchSubjects(String searchTerm, Boolean isActive, SubjectType subjectType, Pageable pageable);

    /**
     * Soft delete a subject master
     * @param id Subject master ID
     * @throws IllegalArgumentException if subject not found
     * @throws IllegalStateException if subject is currently in use
     */
    void deleteSubject(Long id);

    /**
     * Activate/deactivate a subject master
     * @param id Subject master ID
     * @param isActive New active status
     * @return Updated subject master DTO
     * @throws IllegalArgumentException if subject not found
     * @throws IllegalStateException if trying to deactivate a subject in use
     */
    SubjectMasterDTO updateSubjectStatus(Long id, Boolean isActive);

    /**
     * Check if a subject code exists
     * @param subjectCode Subject code to check
     * @return true if exists, false otherwise
     */
    boolean existsByCode(String subjectCode);

    /**
     * Check if a subject name exists among active subjects
     * @param subjectName Subject name to check
     * @return true if exists, false otherwise
     */
    boolean existsByName(String subjectName);

    /**
     * Get subjects that are currently in use (have configurations)
     * @return List of subject master DTOs that are in use
     */
    List<SubjectMasterDTO> getSubjectsInUse();

    /**
     * Get subjects that are not currently in use
     * @return List of subject master DTOs that are not in use
     */
    List<SubjectMasterDTO> getSubjectsNotInUse();

    /**
     * Get subjects with their configuration count
     * @return List of subject master DTOs with configuration count
     */
    List<SubjectMasterDTO> getSubjectsWithConfigurationCount();

    /**
     * Validate subject master request
     * @param request Request to validate
     * @param excludeId ID to exclude from validation (for updates)
     * @throws IllegalArgumentException if validation fails
     */
    void validateSubjectRequest(SubjectMasterRequest request, Long excludeId);
}
