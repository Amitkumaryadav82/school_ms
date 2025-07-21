package com.school.exam.dto;

import java.time.LocalDate;
import java.util.List;

public class ExamDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDate date;
    private String term;
    private List<Integer> classIds;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }
    public List<Integer> getClassIds() { return classIds; }
    public void setClassIds(List<Integer> classIds) { this.classIds = classIds; }
}
