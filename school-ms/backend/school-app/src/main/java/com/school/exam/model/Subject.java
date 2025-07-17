package com.school.exam.model;

import javax.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;


    @Column
    private String code;

    @Column
    private String description;

    @Column(name = "max_marks")
    private Integer maxMarks;

    @Column(name = "theory_marks")
    private Integer theoryMarks;

    @Column(name = "practical_marks")
    private Integer practicalMarks;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Integer maxMarks) { this.maxMarks = maxMarks; }
    public Integer getTheoryMarks() { return theoryMarks; }
    public void setTheoryMarks(Integer theoryMarks) { this.theoryMarks = theoryMarks; }
    public Integer getPracticalMarks() { return practicalMarks; }
    public void setPracticalMarks(Integer practicalMarks) { this.practicalMarks = practicalMarks; }
}
