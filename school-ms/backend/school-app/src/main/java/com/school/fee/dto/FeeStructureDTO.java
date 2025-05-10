package com.school.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeStructureDTO {
    private Long id;
    private Integer classGrade;
    private BigDecimal annualFees;
    private BigDecimal buildingFees;
    private BigDecimal labFees;
    private List<PaymentScheduleDTO> paymentSchedules = new ArrayList<>();
    private List<LateFeeDTO> lateFees = new ArrayList<>();
    private BigDecimal totalFees;
}