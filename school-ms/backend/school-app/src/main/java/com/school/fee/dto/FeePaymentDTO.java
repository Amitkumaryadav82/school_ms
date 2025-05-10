package com.school.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeePaymentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long feeStructureId;
    private Integer classGrade;
    private Long paymentScheduleId;
    private String scheduleType;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
    private String paymentMode;
    private String transactionReference;
    private String remarks;
}