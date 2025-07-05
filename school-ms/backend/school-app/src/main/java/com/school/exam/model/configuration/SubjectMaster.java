package com.school.exam.model.configuration;

import com.school.common.model.Auditable;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * Entity representing a master subject definition in the school system.
 * This serves as the central repository for all subjects that can be 
 * configured for different classes and examinations.
 */
@Entity
@Table(name = "subject_masters", 
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_subject_code", columnNames = "subject_code"),
           @UniqueConstraint(name = "uk_subject_name_active", columnNames = {"subject_name", "is_active"})
       },
       indexes = {
           @Index(name = "idx_subject_type", columnList = "subject_type"),
           @Index(name = "idx_subject_is_active", columnList = "is_active")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true, of = {"subjectCode"})
@ToString(exclude = {"configurationSubjects"})
public class SubjectMaster extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique code for the subject (e.g., "MATH01", "ENG01", "PHY01")
     */
    @Column(name = "subject_code", nullable = false, unique = true, length = 20)
    @NotBlank(message = "Subject code is required")
    @Size(min = 2, max = 20, message = "Subject code must be between 2 and 20 characters")
    private String subjectCode;

    /**
     * Display name of the subject (e.g., "Mathematics", "English Literature", "Physics")
     */
    @Column(name = "subject_name", nullable = false, length = 100)
    @NotBlank(message = "Subject name is required")
    @Size(min = 2, max = 100, message = "Subject name must be between 2 and 100 characters")
    private String subjectName;

    /**
     * Optional description providing more details about the subject
     */
    @Column(name = "description", length = 500)
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    /**
     * Type of subject - determines how it can be configured for examinations
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "subject_type", nullable = false, length = 20)
    @NotNull(message = "Subject type is required")
    private SubjectType subjectType;

    /**
     * Flag indicating if the subject is currently active and available for use
     */
    @Column(name = "is_active", nullable = false)
    @NotNull
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Bidirectional relationship with ConfigurationSubject
     * This is marked as LAZY to avoid unnecessary loading
     */
    @OneToMany(mappedBy = "subjectMaster", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<ConfigurationSubject> configurationSubjects = new java.util.ArrayList<>();

    /**
     * Business logic method to check if this subject supports theory component
     */
    public boolean supportsTheory() {
        return subjectType == SubjectType.THEORY || subjectType == SubjectType.BOTH;
    }

    /**
     * Business logic method to check if this subject supports practical component
     */
    public boolean supportsPractical() {
        return subjectType == SubjectType.PRACTICAL || subjectType == SubjectType.BOTH;
    }

    /**
     * Business logic method to check if this subject requires both theory and practical
     */
    public boolean requiresBothComponents() {
        return subjectType == SubjectType.BOTH;
    }

    /**
     * Helper method to safely add a configuration subject
     */
    public void addConfigurationSubject(ConfigurationSubject configurationSubject) {
        if (configurationSubjects == null) {
            configurationSubjects = new java.util.ArrayList<>();
        }
        configurationSubjects.add(configurationSubject);
        configurationSubject.setSubjectMaster(this);
    }

    /**
     * Helper method to safely remove a configuration subject
     */
    public void removeConfigurationSubject(ConfigurationSubject configurationSubject) {
        if (configurationSubjects != null) {
            configurationSubjects.remove(configurationSubject);
            configurationSubject.setSubjectMaster(null);
        }
    }
}
