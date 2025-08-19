package com.school.timetable.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "timetable_slots", uniqueConstraints = @UniqueConstraint(columnNames = {
        "class_id", "section_id", "day_of_week", "period_no"
}))
public class TimetableSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek; // 1=Mon..7=Sun

    @Column(name = "period_no", nullable = false)
    private Integer periodNo;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "teacher_details_id")
    private Long teacherDetailsId;

    @Column(name = "locked")
    private Boolean locked = false;

    @Column(name = "generated_by")
    private String generatedBy;

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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
    }

    public Integer getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public Integer getPeriodNo() {
        return periodNo;
    }

    public void setPeriodNo(Integer periodNo) {
        this.periodNo = periodNo;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public Long getTeacherDetailsId() {
        return teacherDetailsId;
    }

    public void setTeacherDetailsId(Long teacherDetailsId) {
        this.teacherDetailsId = teacherDetailsId;
    }

    public Boolean getLocked() {
        return locked;
    }

    public void setLocked(Boolean locked) {
        this.locked = locked;
    }

    public String getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(String generatedBy) {
        this.generatedBy = generatedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
