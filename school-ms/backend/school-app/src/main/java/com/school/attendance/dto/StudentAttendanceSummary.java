package com.school.attendance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAttendanceSummary {
    private Long studentId;
    private String studentName;
    private int totalDays;
    private int presentDays;
    private int absentDays;
    private int lateDays;
    private double attendancePercentage;
    private String remarks;
}