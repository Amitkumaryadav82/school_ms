package com.school.exam.model.configuration;

import com.school.common.model.Auditable;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a class configuration for examination management.
 * This defines the examination setup for a specific class, section, and academic year.
 */
@Entity
@Table(name = "class_configurations",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_class_section_year", 
                           columnNames = {"class_name", "section", "academic_year"})
       },
       indexes = {
           @Index(name = "idx_class_name", columnList = "class_name"),
           @Index(name = "idx_academic_year", columnList = "academic_year"),
           @Index(name = "idx_is_active", columnList = "is_active")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true, of = {"className", "section", "academicYear"})
@ToString(exclude = {"subjects"})
public class ClassConfiguration extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Class name (e.g., "Grade 1", "Class X", "12th")
     */
    @Column(name = "class_name", nullable = false, length = 50)
    @NotBlank(message = "Class name is required")
    @Size(min = 1, max = 50, message = "Class name must be between 1 and 50 characters")
    private String className;

    /**
     * Section within the class (e.g., "A", "B", "Science", "Commerce")
     */
    @Column(name = "section", nullable = false, length = 20)
    @NotBlank(message = "Section is required")
    @Size(min = 1, max = 20, message = "Section must be between 1 and 20 characters")
    private String section;

    /**
     * Academic year for this configuration (e.g., "2023-24", "2024-25")
     */
    @Column(name = "academic_year", nullable = false, length = 10)
    @NotBlank(message = "Academic year is required")
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "Academic year must be in format YYYY-YY (e.g., 2023-24)")
    private String academicYear;

    /**
     * Optional description for this configuration
     */
    @Column(name = "description", length = 500)
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    /**
     * Flag indicating if the configuration is currently active
     */
    @Column(name = "is_active", nullable = false)
    @NotNull
    @Builder.Default
    private Boolean isActive = true;

    /**
     * List of subjects configured for this class
     * Cascaded operations ensure that configuration subjects are managed with the configuration
     */
    @OneToMany(mappedBy = "classConfiguration", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<ConfigurationSubject> subjects = new ArrayList<>();

    /**
     * Business logic method to get the full display name of the configuration
     */
    public String getFullDisplayName() {
        return String.format("%s - %s (%s)", className, section, academicYear);
    }

    /**
     * Business logic method to check if configuration has any subjects
     */
    public boolean hasSubjects() {
        return subjects != null && !subjects.isEmpty();
    }

    /**
     * Business logic method to get count of active subjects
     */
    public int getActiveSubjectCount() {
        if (subjects == null) {
            return 0;
        }
        return (int) subjects.stream()
                .filter(cs -> cs.getIsActive() != null && cs.getIsActive())
                .count();
    }

    /**
     * Business logic method to calculate total marks across all active subjects
     */
    public int getTotalMarksAcrossSubjects() {
        if (subjects == null) {
            return 0;
        }
        return subjects.stream()
                .filter(cs -> cs.getIsActive() != null && cs.getIsActive())
                .mapToInt(cs -> cs.getTotalMarks() != null ? cs.getTotalMarks() : 0)
                .sum();
    }

    /**
     * Helper method to safely add a subject to this configuration
     */
    public void addSubject(ConfigurationSubject configurationSubject) {
        if (subjects == null) {
            subjects = new ArrayList<>();
        }
        subjects.add(configurationSubject);
        configurationSubject.setClassConfiguration(this);
    }

    /**
     * Helper method to safely remove a subject from this configuration
     */
    public void removeSubject(ConfigurationSubject configurationSubject) {
        if (subjects != null) {
            subjects.remove(configurationSubject);
            configurationSubject.setClassConfiguration(null);
        }
    }

    /**
     * Helper method to find a subject by subject master ID
     */
    public ConfigurationSubject findSubjectByMasterId(Long subjectMasterId) {
        if (subjects == null || subjectMasterId == null) {
            return null;
        }
        return subjects.stream()
                .filter(cs -> cs.getSubjectMaster() != null && 
                            subjectMasterId.equals(cs.getSubjectMaster().getId()))
                .findFirst()
                .orElse(null);
    }

    /**
     * Helper method to check if a subject master is already configured
     */
    public boolean hasSubjectMaster(Long subjectMasterId) {
        return findSubjectByMasterId(subjectMasterId) != null;
    }
}
