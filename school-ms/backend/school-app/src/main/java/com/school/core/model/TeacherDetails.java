package com.school.core.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;

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
@JsonIgnoreProperties({"staff"}) // Prevent circular reference during serialization
public class TeacherDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String department;
    
    private String qualification;
      private String specialization;
    
    @Column(name = "subjects_taught")
    private String subjectsTaught;
    
    @Column(name = "subjects")
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
    @JsonBackReference
    private Staff staff;
    
    public Long getId() {
        return this.id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getDepartment() {
        return this.department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public void setSubjectsTaught(String subjectsTaught) {
        this.subjectsTaught = subjectsTaught;
    }
      public String getSubjectsTaught() {
        return this.subjectsTaught;
    }
    
    public String getSubjects() {
        return this.subjects != null ? this.subjects : this.subjectsTaught;
    }
    
    public void setSubjects(String subjects) {
        this.subjects = subjects;
        if (this.subjectsTaught == null) {
            this.subjectsTaught = subjects;
        }
    }
    
    public void setQualification(String qualification) {
        this.qualification = qualification;
    }
    
    public String getQualification() {
        return this.qualification;
    }
    
    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
    
    public String getSpecialization() {
        return this.specialization;
    }
    
    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }
    
    public Integer getYearsOfExperience() {
        return this.yearsOfExperience;
    }
    
    public String getCertifications() {
        return this.certifications;
    }
    
    public void setCertifications(String certifications) {
        this.certifications = certifications;
    }
    
    public String getEducationalBackground() {
        return this.educationalBackground;
    }
    
    public void setEducationalBackground(String educationalBackground) {
        this.educationalBackground = educationalBackground;
    }
    
    public String getProfessionalDevelopment() {
        return this.professionalDevelopment;
    }
    
    public void setProfessionalDevelopment(String professionalDevelopment) {
        this.professionalDevelopment = professionalDevelopment;
    }
    
    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Staff getStaff() {
        return this.staff;
    }
    
    public void setStaff(Staff staff) {
        this.staff = staff;
    }

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
