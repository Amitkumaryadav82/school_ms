package com.school.core.dto;

import com.school.core.model.TeacherDetails;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for TeacherDetails.
 * This DTO avoids circular references by not including a Staff reference.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDetailsDTO {
    private Long id;
    private String department;
    private String qualification;
    private String specialization;
    private String subjectsTaught;
    private String subjects;
    private Integer yearsOfExperience;
    private String certifications;
    private String educationalBackground;
    private String professionalDevelopment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Static factory method to convert a TeacherDetails entity to a DTO
     * 
     * @param details The TeacherDetails entity
     * @return A TeacherDetailsDTO without the staff reference
     */
    public static TeacherDetailsDTO fromEntity(TeacherDetails details) {
        if (details == null) return null;
        
        return TeacherDetailsDTO.builder()
            .id(details.getId())
            .department(details.getDepartment())
            .qualification(details.getQualification())
            .specialization(details.getSpecialization())
            .subjectsTaught(details.getSubjectsTaught())
            .subjects(details.getSubjects())
            .yearsOfExperience(details.getYearsOfExperience())
            .certifications(details.getCertifications())
            .educationalBackground(details.getEducationalBackground())
            .professionalDevelopment(details.getProfessionalDevelopment())
            .createdAt(details.getCreatedAt())
            .updatedAt(details.getUpdatedAt())
            .build();
    }
    
    /**
     * Converts this DTO to a TeacherDetails entity, optionally updating an existing entity.
     * Note: This does NOT set the staff field - that must be handled separately to avoid circular references.
     * 
     * @param existingDetails Optional existing TeacherDetails entity to update (null to create new)
     * @return A TeacherDetails entity with values from this DTO
     */
    public TeacherDetails toEntity(TeacherDetails existingDetails) {
        TeacherDetails details = existingDetails != null ? existingDetails : new TeacherDetails();
        
        // Only set ID if it's a new entity to avoid changing primary keys
        if (existingDetails == null && this.id != null) {
            details.setId(this.id);
        }
        
        details.setDepartment(this.department);
        details.setQualification(this.qualification);
        details.setSpecialization(this.specialization);
        details.setSubjectsTaught(this.subjectsTaught);
        details.setSubjects(this.subjects);
        details.setYearsOfExperience(this.yearsOfExperience);
        details.setCertifications(this.certifications);
        details.setEducationalBackground(this.educationalBackground);
        details.setProfessionalDevelopment(this.professionalDevelopment);
        
        // Preserve timestamps if they exist
        if (this.createdAt != null) {
            details.setCreatedAt(this.createdAt);
        }
        
        if (this.updatedAt != null) {
            details.setUpdatedAt(this.updatedAt);
        }
        
        return details;
    }
    
    /**
     * Creates a TeacherDetails entity and associates it with a Staff entity.
     * 
     * @param existingDetails Optional existing TeacherDetails entity to update (null to create new)
     * @param staff The Staff entity to associate with this TeacherDetails
     * @return A TeacherDetails entity with values from this DTO and the associated Staff
     */
    public TeacherDetails toEntityWithStaff(TeacherDetails existingDetails, com.school.core.model.Staff staff) {
        TeacherDetails details = toEntity(existingDetails);
        
        // Set the staff association - this is the key to handling the bidirectional relationship
        if (staff != null) {
            details.setStaff(staff);
            
            // Ensure the staff entity references this teacher details
            if (staff.getTeacherDetails() != details) {
                staff.setTeacherDetails(details);
            }
        }
        
        return details;
    }
}
