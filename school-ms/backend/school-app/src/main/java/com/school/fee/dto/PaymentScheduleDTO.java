package com.school.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentScheduleDTO {
    private Long id;
    private Long feeStructureId;
    private String scheduleType;
    private BigDecimal amount;
    private Boolean isEnabled;
}