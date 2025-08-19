package com.school.staff.model;

import com.school.core.model.TeacherDetails;
import com.school.exam.model.SchoolClass;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_class_map",
       uniqueConstraints = @UniqueConstraint(columnNames = {"teacher_details_id", "class_id", "section"}))
public class TeacherClassMap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "teacher_details_id", nullable = false)
    private TeacherDetails teacherDetails;

    @ManyToOne(optional = false)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @Column(name = "section", length = 5, nullable = false)
    private String section; // e.g., A/B/C/D

    @Column(name = "academic_year", length = 9)
    private String academicYear; // e.g., 2025-2026

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TeacherDetails getTeacherDetails() { return teacherDetails; }
    public void setTeacherDetails(TeacherDetails teacherDetails) { this.teacherDetails = teacherDetails; }
    public SchoolClass getSchoolClass() { return schoolClass; }
    public void setSchoolClass(SchoolClass schoolClass) { this.schoolClass = schoolClass; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
