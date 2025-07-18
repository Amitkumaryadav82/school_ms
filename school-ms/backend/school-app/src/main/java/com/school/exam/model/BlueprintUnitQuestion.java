package com.school.exam.model;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
public class BlueprintUnitQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int count;
    private int marksPerQuestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    @JsonBackReference
    private BlueprintUnit unit;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
    public int getMarksPerQuestion() { return marksPerQuestion; }
    public void setMarksPerQuestion(int marksPerQuestion) { this.marksPerQuestion = marksPerQuestion; }
    public BlueprintUnit getUnit() { return unit; }
    public void setUnit(BlueprintUnit unit) { this.unit = unit; }
}
