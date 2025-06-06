package com.school.fee.dto;

import com.school.fee.model.Payment.PaymentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class FeePaymentSummary {
    // Original fields for single fee summary
    private Long feeId;
    private String feeName;
    private Double totalAmount;
    private Double paidAmount;
    private Double remainingAmount;
    private LocalDate dueDate;
    private PaymentStatus status;
    private Double latePaymentCharges;
    private boolean isOverdue;
    
    // Additional fields for report generation
    private Long studentId;
    private String studentName;
    private String lastPaymentDate;
    private String nextDueDate;
}