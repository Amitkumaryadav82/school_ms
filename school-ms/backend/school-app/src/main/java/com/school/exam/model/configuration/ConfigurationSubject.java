package com.school.exam.model.configuration;

import com.school.common.model.Auditable;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

/**
 * Entity representing the assignment of a subject to a class configuration
 * with specific examination parameters and marks distribution.
 */
@Entity
@Table(name = "configuration_subjects",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_config_subject", 
                           columnNames = {"class_configuration_id", "subject_master_id"})
       },
       indexes = {
           @Index(name = "idx_class_config", columnList = "class_configuration_id"),
           @Index(name = "idx_subject_master", columnList = "subject_master_id"),
           @Index(name = "idx_is_active", columnList = "is_active")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true, of = {"classConfiguration", "subjectMaster"})
@ToString(exclude = {"classConfiguration", "subjectMaster"})
public class ConfigurationSubject extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Reference to the class configuration this subject belongs to
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_configuration_id", nullable = false, 
                foreignKey = @ForeignKey(name = "fk_config_subject_class"))
    @NotNull(message = "Class configuration is required")
    private ClassConfiguration classConfiguration;

    /**
     * Reference to the subject master definition
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_master_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_config_subject_master"))
    @NotNull(message = "Subject master is required")
    private SubjectMaster subjectMaster;

    /**
     * Total marks for this subject in examinations
     */
    @Column(name = "total_marks", nullable = false)
    @NotNull(message = "Total marks is required")
    @Min(value = 1, message = "Total marks must be at least 1")
    private Integer totalMarks;

    /**
     * Minimum marks required to pass this subject
     */
    @Column(name = "passing_marks", nullable = false)
    @NotNull(message = "Passing marks is required")
    @Min(value = 1, message = "Passing marks must be at least 1")
    private Integer passingMarks;

    /**
     * Marks allocated to theory component (if applicable)
     * Should be null for PRACTICAL subjects, required for THEORY and BOTH
     */
    @Column(name = "theory_marks")
    @Min(value = 1, message = "Theory marks must be at least 1 if specified")
    private Integer theoryMarks;

    /**
     * Marks allocated to practical component (if applicable)
     * Should be null for THEORY subjects, required for PRACTICAL and BOTH
     */
    @Column(name = "practical_marks")
    @Min(value = 1, message = "Practical marks must be at least 1 if specified")
    private Integer practicalMarks;

    /**
     * Minimum marks required to pass theory component
     */
    @Column(name = "theory_passing_marks")
    @Min(value = 1, message = "Theory passing marks must be at least 1 if specified")
    private Integer theoryPassingMarks;

    /**
     * Minimum marks required to pass practical component
     */
    @Column(name = "practical_passing_marks")
    @Min(value = 1, message = "Practical passing marks must be at least 1 if specified")
    private Integer practicalPassingMarks;

    /**
     * Flag indicating if this subject configuration is active
     */
    @Column(name = "is_active", nullable = false)
    @NotNull
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Business logic method to validate marks distribution based on subject type
     */
    public boolean isValidMarksDistribution() {
        if (subjectMaster == null || totalMarks == null) {
            return false;
        }

        SubjectType type = subjectMaster.getSubjectType();
        
        switch (type) {
            case THEORY:
                // Theory subjects should have theory marks equal to total marks
                // Practical marks should be null
                return theoryMarks != null && 
                       theoryMarks.equals(totalMarks) && 
                       practicalMarks == null;
                
            case PRACTICAL:
                // Practical subjects should have practical marks equal to total marks
                // Theory marks should be null
                return practicalMarks != null && 
                       practicalMarks.equals(totalMarks) && 
                       theoryMarks == null;
                
            case BOTH:
                // Both type subjects should have theory + practical = total
                return theoryMarks != null && 
                       practicalMarks != null && 
                       (theoryMarks + practicalMarks) == totalMarks;
                
            default:
                return false;
        }
    }

    /**
     * Business logic method to validate passing marks constraints
     */
    public boolean isValidPassingMarks() {
        if (passingMarks == null || totalMarks == null || passingMarks > totalMarks) {
            return false;
        }

        // Check theory passing marks if applicable
        if (theoryMarks != null && theoryPassingMarks != null && theoryPassingMarks > theoryMarks) {
            return false;
        }

        // Check practical passing marks if applicable
        if (practicalMarks != null && practicalPassingMarks != null && practicalPassingMarks > practicalMarks) {
            return false;
        }

        return true;
    }

    /**
     * Business logic method to get display name combining class and subject info
     */
    public String getDisplayName() {
        if (classConfiguration == null || subjectMaster == null) {
            return "Unknown Configuration";
        }
        return String.format("%s - %s", 
                           classConfiguration.getFullDisplayName(), 
                           subjectMaster.getSubjectName());
    }

    /**
     * Business logic method to calculate passing percentage
     */
    public double getPassingPercentage() {
        if (totalMarks == null || passingMarks == null || totalMarks == 0) {
            return 0.0;
        }
        return (passingMarks.doubleValue() / totalMarks.doubleValue()) * 100.0;
    }

    /**
     * Business logic method to check if this configuration supports theory
     */
    public boolean supportsTheory() {
        return subjectMaster != null && subjectMaster.supportsTheory();
    }

    /**
     * Business logic method to check if this configuration supports practical
     */
    public boolean supportsPractical() {
        return subjectMaster != null && subjectMaster.supportsPractical();
    }

    /**
     * Business logic method to check if both components are required
     */
    public boolean requiresBothComponents() {
        return subjectMaster != null && subjectMaster.requiresBothComponents();
    }

    /**
     * Helper method for pre-persist validation
     */
    @PrePersist
    @PreUpdate
    private void validateBeforeSave() {
        if (!isValidMarksDistribution()) {
            throw new IllegalStateException("Invalid marks distribution for subject type: " + 
                                          (subjectMaster != null ? subjectMaster.getSubjectType() : "Unknown"));
        }
        
        if (!isValidPassingMarks()) {
            throw new IllegalStateException("Passing marks cannot exceed total marks");
        }
    }
}
