package com.school.exam.dto;

public class BlueprintUnitQuestionDTO {
    private Long id;
    private int count;
    private int marksPerQuestion;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
    public int getMarksPerQuestion() { return marksPerQuestion; }
    public void setMarksPerQuestion(int marksPerQuestion) { this.marksPerQuestion = marksPerQuestion; }
}
