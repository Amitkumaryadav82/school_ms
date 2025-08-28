package com.school.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDeletionImpactDTO {
    private Long studentId;
    private int attendanceCount;
    private int paymentsCount;
    private int feePaymentsCount;
    private int paymentSchedulesCount;
    private int feeAssignmentsCount;
}
