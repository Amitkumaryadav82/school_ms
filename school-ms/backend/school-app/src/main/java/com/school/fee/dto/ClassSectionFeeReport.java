package com.school.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassSectionFeeReport {
    private Integer grade;
    private String section;
    private String academicYear;
    private Double totalFeesCharged;
    private Double totalCollected;
    private Double totalPending;
    private Double totalOverdue;
    private Integer totalStudents;
    private Integer studentsWithCompletePayment;
    private Integer studentsWithPendingPayment;
    private Integer studentsWithOverduePayment;
    private Map<String, Double> feeTypeDistribution;
    private List<StudentFeeDetail> studentDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentFeeDetail {
        private Long studentId;
        private String studentName;
        private Double totalFees;
        private Double paidAmount;
        private Double pendingAmount;
        private Boolean isOverdue;
        private String paymentScheduleType;
    }
}