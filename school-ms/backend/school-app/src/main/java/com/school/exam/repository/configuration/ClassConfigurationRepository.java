package com.school.exam.repository.configuration;

import com.school.exam.model.configuration.ClassConfiguration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ClassConfiguration entity operations.
 * Provides custom query methods for class configuration management.
 */
@Repository
public interface ClassConfigurationRepository extends JpaRepository<ClassConfiguration, Long> {

    /**
     * Find configuration by class, section, and academic year
     */
    Optional<ClassConfiguration> findByClassNameAndSectionAndAcademicYear(
            String className, String section, String academicYear);

    /**
     * Find all active configurations
     */
    List<ClassConfiguration> findByIsActiveTrue();

    /**
     * Find all active configurations with pagination
     */
    Page<ClassConfiguration> findByIsActiveTrue(Pageable pageable);

    /**
     * Find configurations by academic year
     */
    List<ClassConfiguration> findByAcademicYear(String academicYear);

    /**
     * Find active configurations by academic year
     */
    List<ClassConfiguration> findByAcademicYearAndIsActiveTrue(String academicYear);

    /**
     * Find configurations by class name
     */
    List<ClassConfiguration> findByClassName(String className);

    /**
     * Find active configurations by class name
     */
    List<ClassConfiguration> findByClassNameAndIsActiveTrue(String className);

    /**
     * Find configurations by class name and academic year
     */
    List<ClassConfiguration> findByClassNameAndAcademicYear(String className, String academicYear);

    /**
     * Check if a configuration exists for class, section, and year (excluding specific ID)
     */
    boolean existsByClassNameAndSectionAndAcademicYearAndIdNot(
            String className, String section, String academicYear, Long id);

    /**
     * Check if a configuration exists for class, section, and year
     */
    boolean existsByClassNameAndSectionAndAcademicYear(
            String className, String section, String academicYear);

    /**
     * Search configurations by class name or section (case-insensitive)
     */
    @Query("SELECT cc FROM ClassConfiguration cc WHERE " +
           "(LOWER(cc.className) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(cc.section) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "cc.isActive = :isActive AND " +
           "cc.academicYear = :academicYear")
    Page<ClassConfiguration> searchByClassOrSection(@Param("searchTerm") String searchTerm,
                                                   @Param("isActive") Boolean isActive,
                                                   @Param("academicYear") String academicYear,
                                                   Pageable pageable);

    /**
     * Find configurations with subject count
     */
    @Query("SELECT cc, COUNT(cs) as subjectCount FROM ClassConfiguration cc " +
           "LEFT JOIN cc.subjects cs " +
           "WHERE cc.isActive = true AND cc.academicYear = :academicYear " +
           "GROUP BY cc " +
           "ORDER BY cc.className, cc.section")
    List<Object[]> findConfigurationsWithSubjectCount(@Param("academicYear") String academicYear);

    /**
     * Find configurations without any subjects
     */
    @Query("SELECT cc FROM ClassConfiguration cc WHERE cc.id NOT IN " +
           "(SELECT DISTINCT cs.classConfiguration.id FROM ConfigurationSubject cs WHERE cs.isActive = true) " +
           "AND cc.isActive = true")
    List<ClassConfiguration> findConfigurationsWithoutSubjects();

    /**
     * Find configurations with at least one subject
     */
    @Query("SELECT DISTINCT cc FROM ClassConfiguration cc " +
           "INNER JOIN cc.subjects cs " +
           "WHERE cs.isActive = true AND cc.isActive = true")
    List<ClassConfiguration> findConfigurationsWithSubjects();

    /**
     * Get distinct academic years
     */
    @Query("SELECT DISTINCT cc.academicYear FROM ClassConfiguration cc " +
           "WHERE cc.isActive = true ORDER BY cc.academicYear DESC")
    List<String> findDistinctAcademicYears();

    /**
     * Get distinct class names for an academic year
     */
    @Query("SELECT DISTINCT cc.className FROM ClassConfiguration cc " +
           "WHERE cc.academicYear = :academicYear AND cc.isActive = true " +
           "ORDER BY cc.className")
    List<String> findDistinctClassNamesByAcademicYear(@Param("academicYear") String academicYear);

    /**
     * Get sections for a specific class and academic year
     */
    @Query("SELECT cc.section FROM ClassConfiguration cc " +
           "WHERE cc.className = :className AND cc.academicYear = :academicYear AND cc.isActive = true " +
           "ORDER BY cc.section")
    List<String> findSectionsByClassNameAndAcademicYear(@Param("className") String className,
                                                       @Param("academicYear") String academicYear);

    /**
     * Count configurations by academic year
     */
    long countByAcademicYearAndIsActiveTrue(String academicYear);

    /**
     * Find configurations that can be copied (source configurations)
     */
    @Query("SELECT cc FROM ClassConfiguration cc " +
           "WHERE cc.isActive = true AND " +
           "EXISTS (SELECT 1 FROM ConfigurationSubject cs WHERE cs.classConfiguration = cc AND cs.isActive = true) " +
           "ORDER BY cc.academicYear DESC, cc.className, cc.section")
    List<ClassConfiguration> findCopyableConfigurations();

    /**
     * Find similar configurations (same class name, different section/year)
     */
    @Query("SELECT cc FROM ClassConfiguration cc " +
           "WHERE cc.className = :className AND cc.isActive = true AND " +
           "(cc.section != :section OR cc.academicYear != :academicYear) " +
           "ORDER BY cc.academicYear DESC, cc.section")
    List<ClassConfiguration> findSimilarConfigurations(@Param("className") String className,
                                                      @Param("section") String section,
                                                      @Param("academicYear") String academicYear);
}
