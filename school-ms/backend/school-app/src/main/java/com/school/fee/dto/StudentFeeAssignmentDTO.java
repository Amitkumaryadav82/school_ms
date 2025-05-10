package com.school.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentFeeAssignmentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long feeStructureId;
    private Integer classGrade;
    private Long paymentScheduleId;
    private String scheduleType;
    private Long transportRouteId;
    private String routeName;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Boolean isActive;
}