package com.school.fee.dto;

import com.school.fee.model.FeePaymentSchedule.PaymentFrequency;

import java.time.LocalDate;
import java.util.List;

public class FeePaymentScheduleResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private PaymentFrequency paymentFrequency;
    private Integer academicYear;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isActive;
    private String notes;
    private List<FeeInstallmentResponse> installments;

    // Default constructor
    public FeePaymentScheduleResponse() {
    }

    // Constructor with fields
    public FeePaymentScheduleResponse(Long id, Long studentId, String studentName,
            PaymentFrequency paymentFrequency, Integer academicYear,
            LocalDate startDate, LocalDate endDate, boolean isActive,
            String notes, List<FeeInstallmentResponse> installments) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.paymentFrequency = paymentFrequency;
        this.academicYear = academicYear;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = isActive;
        this.notes = notes;
        this.installments = installments;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public PaymentFrequency getPaymentFrequency() {
        return paymentFrequency;
    }

    public void setPaymentFrequency(PaymentFrequency paymentFrequency) {
        this.paymentFrequency = paymentFrequency;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<FeeInstallmentResponse> getInstallments() {
        return installments;
    }

    public void setInstallments(List<FeeInstallmentResponse> installments) {
        this.installments = installments;
    }
}