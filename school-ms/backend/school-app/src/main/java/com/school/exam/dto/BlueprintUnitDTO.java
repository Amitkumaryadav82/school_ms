package com.school.exam.dto;

import java.util.List;

public class BlueprintUnitDTO {
    private Long id;
    private String name;
    private Integer marks;
    private Long classId;
    private String className;
    private Long subjectId;
    private String subjectName;
    private List<BlueprintUnitQuestionDTO> questions;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getMarks() { return marks; }
    public void setMarks(Integer marks) { this.marks = marks; }
    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public List<BlueprintUnitQuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<BlueprintUnitQuestionDTO> questions) { this.questions = questions; }
}
