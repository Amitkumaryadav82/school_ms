package com.school.core.model.legacy;

import java.util.Date;
import lombok.Data;

/**
 * A simplified version of the legacy TeacherDetails class for migration purposes.
 * This replaces references to com.example.schoolms.model.TeacherDetails 
 */
@Data
public class LegacyTeacherDetails {
    private Long id;
    private String department;    private String qualification;
    private String specialization;
    private String subjects;
    private String subjectsTaught;
    private Integer yearsOfExperience;
    
    // Getter for subjectsTaught, falls back to subjects if null
    public String getSubjectsTaught() {
        return subjectsTaught != null ? subjectsTaught : subjects;
    }
    private Date createdAt;
    private Date updatedAt;
    
    // Default constructor
    public LegacyTeacherDetails() {}
}
