package com.school.fee.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for Fee Installment response
 */
public class FeeInstallmentResponse {

    private Long id;
    private Integer installmentNumber;
    private LocalDate dueDate;
    private BigDecimal amount;
    private BigDecimal amountPaid;
    private BigDecimal remainingAmount;
    private String status; // PAID, PENDING, OVERDUE, etc.
    private LocalDate paymentDate;
    private String paymentMethod;
    private String receiptNumber;

    // Default constructor
    public FeeInstallmentResponse() {
    }

    // Constructor with fields
    public FeeInstallmentResponse(Long id, Integer installmentNumber, LocalDate dueDate,
            BigDecimal amount, BigDecimal amountPaid, BigDecimal remainingAmount,
            String status, LocalDate paymentDate, String paymentMethod,
            String receiptNumber) {
        this.id = id;
        this.installmentNumber = installmentNumber;
        this.dueDate = dueDate;
        this.amount = amount;
        this.amountPaid = amountPaid;
        this.remainingAmount = remainingAmount;
        this.status = status;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
        this.receiptNumber = receiptNumber;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    @Override
    public String toString() {
        return "FeeInstallmentResponse{" +
                "id=" + id +
                ", installmentNumber=" + installmentNumber +
                ", dueDate=" + dueDate +
                ", amount=" + amount +
                ", amountPaid=" + amountPaid +
                ", remainingAmount=" + remainingAmount +
                ", status='" + status + '\'' +
                ", paymentDate=" + paymentDate +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", receiptNumber='" + receiptNumber + '\'' +
                '}';
    }
}