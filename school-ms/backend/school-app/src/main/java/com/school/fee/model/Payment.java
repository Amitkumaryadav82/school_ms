package com.school.fee.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.school.common.model.BaseEntity;
import com.school.student.model.Student;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_id", nullable = false)
    @JsonIgnore
    private Fee fee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    @NotNull
    @Positive
    private Double amount;

    @NotNull
    private LocalDateTime paymentDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String transactionReference;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String remarks;

    // Additional tracking fields
    private String payerName;
    private String payerContactInfo;
    private String payerRelationToStudent;
    private String receiptNumber;

    // Lightweight fields for serialization
    @Transient
    @JsonProperty("feeId")
    public Long getFeeId() {
        return fee != null ? fee.getId() : null;
    }

    @Transient
    @JsonProperty("studentId")
    public Long getStudentId() {
        return student != null ? student.getId() : null;
    }

    public enum PaymentMethod {
        CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, CHEQUE, ONLINE
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }
}
