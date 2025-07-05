package com.school.exam.repository.configuration;

import com.school.exam.model.configuration.ConfigurationSubject;
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
 * Repository interface for ConfigurationSubject entity operations.
 * Provides custom query methods for subject-class configuration management.
 */
@Repository
public interface ConfigurationSubjectRepository extends JpaRepository<ConfigurationSubject, Long> {

    /**
     * Find configuration subject by class configuration and subject master
     */
    Optional<ConfigurationSubject> findByClassConfigurationIdAndSubjectMasterId(
            Long classConfigurationId, Long subjectMasterId);

    /**
     * Find all active configuration subjects for a class configuration
     */
    List<ConfigurationSubject> findByClassConfigurationIdAndIsActiveTrue(Long classConfigurationId);

    /**
     * Find all configuration subjects for a class configuration
     */
    List<ConfigurationSubject> findByClassConfigurationId(Long classConfigurationId);

    /**
     * Find all active configuration subjects for a subject master
     */
    List<ConfigurationSubject> findBySubjectMasterIdAndIsActiveTrue(Long subjectMasterId);

    /**
     * Find all configuration subjects for a subject master
     */
    List<ConfigurationSubject> findBySubjectMasterId(Long subjectMasterId);

    /**
     * Check if a subject is already configured for a class
     */
    boolean existsByClassConfigurationIdAndSubjectMasterId(Long classConfigurationId, Long subjectMasterId);

    /**
     * Check if a subject is already configured for a class (excluding specific ID)
     */
    boolean existsByClassConfigurationIdAndSubjectMasterIdAndIdNot(
            Long classConfigurationId, Long subjectMasterId, Long id);

    /**
     * Find configuration subjects by subject type
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "JOIN cs.subjectMaster sm " +
           "WHERE sm.subjectType = :subjectType AND cs.isActive = true")
    List<ConfigurationSubject> findBySubjectType(@Param("subjectType") SubjectType subjectType);

    /**
     * Find configuration subjects by academic year
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "JOIN cs.classConfiguration cc " +
           "WHERE cc.academicYear = :academicYear AND cs.isActive = true AND cc.isActive = true")
    List<ConfigurationSubject> findByAcademicYear(@Param("academicYear") String academicYear);

    /**
     * Find configuration subjects by class name and academic year
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "JOIN cs.classConfiguration cc " +
           "WHERE cc.className = :className AND cc.academicYear = :academicYear " +
           "AND cs.isActive = true AND cc.isActive = true")
    List<ConfigurationSubject> findByClassNameAndAcademicYear(@Param("className") String className,
                                                             @Param("academicYear") String academicYear);

    /**
     * Get total marks for a class configuration
     */
    @Query("SELECT SUM(cs.totalMarks) FROM ConfigurationSubject cs " +
           "WHERE cs.classConfiguration.id = :classConfigurationId AND cs.isActive = true")
    Integer getTotalMarksByClassConfigurationId(@Param("classConfigurationId") Long classConfigurationId);

    /**
     * Get subject count for a class configuration
     */
    @Query("SELECT COUNT(cs) FROM ConfigurationSubject cs " +
           "WHERE cs.classConfiguration.id = :classConfigurationId AND cs.isActive = true")
    Long getSubjectCountByClassConfigurationId(@Param("classConfigurationId") Long classConfigurationId);

    /**
     * Find configuration subjects with marks details
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "JOIN FETCH cs.subjectMaster sm " +
           "JOIN FETCH cs.classConfiguration cc " +
           "WHERE cs.isActive = true " +
           "ORDER BY cc.className, sm.subjectName")
    List<ConfigurationSubject> findAllWithDetails();

    /**
     * Find configuration subjects by class configuration with subject details
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "JOIN FETCH cs.subjectMaster sm " +
           "WHERE cs.classConfiguration.id = :classConfigurationId AND cs.isActive = true " +
           "ORDER BY sm.subjectName")
    List<ConfigurationSubject> findByClassConfigurationIdWithSubjectDetails(@Param("classConfigurationId") Long classConfigurationId);

    /**
     * Search configuration subjects by subject name
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "JOIN cs.subjectMaster sm " +
           "JOIN cs.classConfiguration cc " +
           "WHERE LOWER(sm.subjectName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "AND cs.isActive = true AND cc.isActive = true")
    Page<ConfigurationSubject> searchBySubjectName(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find subjects with theory component
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "JOIN cs.subjectMaster sm " +
           "WHERE (sm.subjectType = 'THEORY' OR sm.subjectType = 'BOTH') " +
           "AND cs.isActive = true")
    List<ConfigurationSubject> findSubjectsWithTheory();

    /**
     * Find subjects with practical component
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "JOIN cs.subjectMaster sm " +
           "WHERE (sm.subjectType = 'PRACTICAL' OR sm.subjectType = 'BOTH') " +
           "AND cs.isActive = true")
    List<ConfigurationSubject> findSubjectsWithPractical();

    /**
     * Find configuration subjects by marks range
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "WHERE cs.totalMarks BETWEEN :minMarks AND :maxMarks " +
           "AND cs.isActive = true")
    List<ConfigurationSubject> findByMarksRange(@Param("minMarks") Integer minMarks,
                                               @Param("maxMarks") Integer maxMarks);

    /**
     * Find configuration subjects with invalid marks distribution
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "JOIN cs.subjectMaster sm " +
           "WHERE cs.isActive = true AND (" +
           "(sm.subjectType = 'THEORY' AND (cs.theoryMarks IS NULL OR cs.theoryMarks != cs.totalMarks OR cs.practicalMarks IS NOT NULL)) OR " +
           "(sm.subjectType = 'PRACTICAL' AND (cs.practicalMarks IS NULL OR cs.practicalMarks != cs.totalMarks OR cs.theoryMarks IS NOT NULL)) OR " +
           "(sm.subjectType = 'BOTH' AND (cs.theoryMarks IS NULL OR cs.practicalMarks IS NULL OR (cs.theoryMarks + cs.practicalMarks) != cs.totalMarks))" +
           ")")
    List<ConfigurationSubject> findWithInvalidMarksDistribution();

    /**
     * Delete configuration subjects by class configuration ID
     */
    void deleteByClassConfigurationId(Long classConfigurationId);

    /**
     * Find duplicate configurations (same subject in same class)
     */
    @Query("SELECT cs FROM ConfigurationSubject cs " +
           "WHERE EXISTS (" +
           "    SELECT cs2 FROM ConfigurationSubject cs2 " +
           "    WHERE cs2.classConfiguration = cs.classConfiguration " +
           "    AND cs2.subjectMaster = cs.subjectMaster " +
           "    AND cs2.id != cs.id " +
           "    AND cs2.isActive = true" +
           ") AND cs.isActive = true")
    List<ConfigurationSubject> findDuplicateConfigurations();
}
