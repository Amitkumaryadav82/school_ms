package com.school.timetable.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "timetable_settings")
public class TimetableSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer workingDaysMask; // Mon..Fri bits
    private Integer periodsPerDay;
    private Integer periodDurationMin;
    private Integer lunchAfterPeriod;
    private Integer maxPeriodsPerTeacherPerDay;

    @Column(name = "start_time")
    private LocalTime startTime; // First period start

    @Column(name = "end_time")
    private LocalTime endTime; // Last period end

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

    public Integer getWorkingDaysMask() {
        return workingDaysMask;
    }

    public void setWorkingDaysMask(Integer workingDaysMask) {
        this.workingDaysMask = workingDaysMask;
    }

    public Integer getPeriodsPerDay() {
        return periodsPerDay;
    }

    public void setPeriodsPerDay(Integer periodsPerDay) {
        this.periodsPerDay = periodsPerDay;
    }

    public Integer getPeriodDurationMin() {
        return periodDurationMin;
    }

    public void setPeriodDurationMin(Integer periodDurationMin) {
        this.periodDurationMin = periodDurationMin;
    }

    public Integer getLunchAfterPeriod() {
        return lunchAfterPeriod;
    }

    public void setLunchAfterPeriod(Integer lunchAfterPeriod) {
        this.lunchAfterPeriod = lunchAfterPeriod;
    }

    public Integer getMaxPeriodsPerTeacherPerDay() {
        return maxPeriodsPerTeacherPerDay;
    }

    public void setMaxPeriodsPerTeacherPerDay(Integer maxPeriodsPerTeacherPerDay) {
        this.maxPeriodsPerTeacherPerDay = maxPeriodsPerTeacherPerDay;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
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
