package com.school.core.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Consolidated TeacherDetails entity that combines all fields from both:
 * - com.school.staff.model.TeacherDetails
 * - com.example.schoolms.model.TeacherDetails
 * 
 * This is the single source of truth for teacher details in the application.
 */
@Entity(name = "CoreTeacherDetails")
@Table(name = "teacher_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String department;

    private String qualification;

    private String specialization;

    private String subjects;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    private String certifications;
    
    private String educationalBackground;
    
    @Column(name = "professional_development")
    private String professionalDevelopment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "teacherDetails")
    private Staff staff;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
