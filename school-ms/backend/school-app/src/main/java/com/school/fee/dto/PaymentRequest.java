package com.school.fee.dto;

import com.school.fee.model.Payment.PaymentMethod;
import javax.validation.constraints.*;
import lombok.Data;

@Data
public class PaymentRequest {
    // Optional: when not provided, backend will resolve fee by student's grade or
    // create a default
    private Long feeId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String transactionReference;

    private String remarks;

    // Optional fields for detailed tracking
    private String payerName;
    private String payerContactInfo;
    private String payerRelationToStudent;
    private String receiptNumber;
}
