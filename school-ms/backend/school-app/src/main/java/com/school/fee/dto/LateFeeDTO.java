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
public class LateFeeDTO {
    private Long id;
    private Long feeStructureId;
    private Integer month;
    private String monthName;
    private BigDecimal lateFeeAmount;
    private String lateFeeDescription;
    private BigDecimal fineAmount;
    private String fineDescription;
}