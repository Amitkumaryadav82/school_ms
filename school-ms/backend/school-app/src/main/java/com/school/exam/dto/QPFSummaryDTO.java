package com.school.exam.dto;

import java.util.Map;

public class QPFSummaryDTO {
    private int totalQuestions;
    private double totalMarks;
    private Map<String, Double> unitTotals;

    public QPFSummaryDTO(int totalQuestions, double totalMarks, Map<String, Double> unitTotals) {
        this.totalQuestions = totalQuestions;
        this.totalMarks = totalMarks;
        this.unitTotals = unitTotals;
    }

    public QPFSummaryDTO() {}

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public double getTotalMarks() { return totalMarks; }
    public void setTotalMarks(double totalMarks) { this.totalMarks = totalMarks; }

    public Map<String, Double> getUnitTotals() { return unitTotals; }
    public void setUnitTotals(Map<String, Double> unitTotals) { this.unitTotals = unitTotals; }
}
