package com.school.exam.repository.configuration;

import com.school.exam.model.configuration.SubjectMaster;
import com.school.exam.model.configuration.SubjectType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for SubjectMaster entity operations.
 * Provides custom query methods for subject management.
 */
@Repository
public interface SubjectMasterRepository extends JpaRepository<SubjectMaster, Long> {

    /**
     * Find a subject by its unique code
     */
    Optional<SubjectMaster> findBySubjectCode(String subjectCode);

    /**
     * Find a subject by its name (case-insensitive)
     */
    Optional<SubjectMaster> findBySubjectNameIgnoreCase(String subjectName);

    /**
     * Find all active subjects
     */
    List<SubjectMaster> findByIsActiveTrue();

    /**
     * Find all active subjects with pagination
     */
    Page<SubjectMaster> findByIsActiveTrue(Pageable pageable);

    /**
     * Find subjects by type
     */
    List<SubjectMaster> findBySubjectType(SubjectType subjectType);

    /**
     * Find active subjects by type
     */
    List<SubjectMaster> findBySubjectTypeAndIsActiveTrue(SubjectType subjectType);

    /**
     * Check if a subject code exists (excluding a specific ID for updates)
     */
    boolean existsBySubjectCodeAndIdNot(String subjectCode, Long id);

    /**
     * Check if a subject name exists among active subjects (excluding a specific ID for updates)
     */
    boolean existsBySubjectNameIgnoreCaseAndIsActiveTrueAndIdNot(String subjectName, Long id);

    /**
     * Check if a subject code already exists
     */
    boolean existsBySubjectCode(String subjectCode);

    /**
     * Check if a subject name exists among active subjects
     */
    boolean existsBySubjectNameIgnoreCaseAndIsActiveTrue(String subjectName);

    /**
     * Search subjects by name or code (case-insensitive)
     */
    @Query("SELECT sm FROM SubjectMaster sm WHERE " +
           "(LOWER(sm.subjectName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(sm.subjectCode) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "sm.isActive = :isActive")
    Page<SubjectMaster> searchByNameOrCode(@Param("searchTerm") String searchTerm, 
                                          @Param("isActive") Boolean isActive, 
                                          Pageable pageable);

    /**
     * Search subjects by name or code with type filter (case-insensitive)
     */
    @Query("SELECT sm FROM SubjectMaster sm WHERE " +
           "(:searchTerm IS NULL OR " +
           "LOWER(sm.subjectName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(sm.subjectCode) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:isActive IS NULL OR sm.isActive = :isActive) AND " +
           "(:subjectType IS NULL OR sm.subjectType = :subjectType)")
    Page<SubjectMaster> searchByNameOrCodeAndType(@Param("searchTerm") String searchTerm, 
                                                 @Param("isActive") Boolean isActive,
                                                 @Param("subjectType") SubjectType subjectType,
                                                 Pageable pageable);

    /**
     * Find subjects that are currently in use (have configurations)
     */
    @Query("SELECT DISTINCT sm FROM SubjectMaster sm " +
           "INNER JOIN sm.configurationSubjects cs " +
           "WHERE cs.isActive = true")
    List<SubjectMaster> findSubjectsInUse();

    /**
     * Find subjects that are not currently in use
     */
    @Query("SELECT sm FROM SubjectMaster sm WHERE sm.id NOT IN " +
           "(SELECT DISTINCT cs.subjectMaster.id FROM ConfigurationSubject cs WHERE cs.isActive = true)")
    List<SubjectMaster> findSubjectsNotInUse();

    /**
     * Count active subjects by type
     */
    long countBySubjectTypeAndIsActiveTrue(SubjectType subjectType);

    /**
     * Find subjects by partial name match (case-insensitive)
     */
    @Query("SELECT sm FROM SubjectMaster sm WHERE " +
           "LOWER(sm.subjectName) LIKE LOWER(CONCAT('%', :partialName, '%')) AND " +
           "sm.isActive = true ORDER BY sm.subjectName")
    List<SubjectMaster> findBySubjectNameContainingIgnoreCaseAndIsActiveTrue(@Param("partialName") String partialName);

    /**
     * Find subjects with configurations count
     */
    @Query("SELECT sm, COUNT(cs) as configCount FROM SubjectMaster sm " +
           "LEFT JOIN sm.configurationSubjects cs " +
           "WHERE sm.isActive = true " +
           "GROUP BY sm " +
           "ORDER BY sm.subjectName")
    List<Object[]> findSubjectsWithConfigurationCount();
}
