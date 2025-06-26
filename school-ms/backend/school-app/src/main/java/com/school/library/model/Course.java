package com.school.library.model;

import java.time.LocalDateTime;

public class Course {
    private Long id;
    private String name;
    private String department;
    private Long teacherId;
    private String teacherName; // Transient field for convenience
    private int credits;
    private int capacity;
    private int enrolled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public Course() {
    }

    public Course(Long id, String name, String department, Long teacherId, int credits, int capacity, int enrolled) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.teacherId = teacherId;
        this.credits = credits;
        this.capacity = capacity;
        this.enrolled = enrolled;
    }

    // Getters and setters
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

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public int getCredits() {
        return credits;
    }

    public void setCredits(int credits) {
        this.credits = credits;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getEnrolled() {
        return enrolled;
    }

    public void setEnrolled(int enrolled) {
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
}
