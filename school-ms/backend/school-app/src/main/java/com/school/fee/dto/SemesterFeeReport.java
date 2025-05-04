package com.school.fee.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class SemesterFeeReport {
    private String semester;
    private Integer year;
    private Double totalFeesCharged;
    private Double totalCollected;
    private Double totalPending;
    private Double totalOverdue;
    private int totalStudents;
    private int studentsWithDues;
    private Map<String, Double> feeTypeDistribution;
    private Map<String, Double> paymentMethodDistribution;
    private List<FeePaymentSummary> gradewiseCollection;
}