package com.school.course.model;

import java.time.LocalDateTime;

public class Course {
    private Long id;
    private String name;
    private String department;
    private Long teacherId;
    private Integer credits;
    private Integer capacity;
    private Integer enrolled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Course() {
        // Default constructor
        this.enrolled = 0;
    }

    public Course(Long id, String name, String department, Long teacherId, Integer credits,
            Integer capacity, Integer enrolled, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.teacherId = teacherId;
        this.credits = credits;
        this.capacity = capacity;
        this.enrolled = enrolled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getEnrolled() {
        return enrolled;
    }

    public void setEnrolled(Integer enrolled) {
        this.enrolled = enrolled;
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

    @Override
    public String toString() {
        return "Course{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", department='" + department + '\'' +
                ", teacherId=" + teacherId +
                ", credits=" + credits +
                ", capacity=" + capacity +
                ", enrolled=" + enrolled +
                '}';
    }
}