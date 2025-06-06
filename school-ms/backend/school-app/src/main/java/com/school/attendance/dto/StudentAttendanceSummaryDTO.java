package com.school.attendance.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

/**
 * DTO for student attendance summary information
 */
@Data
@Builder
public class StudentAttendanceSummaryDTO {
    private Long studentId;
    private LocalDate startDate;
    private LocalDate endDate;
    private long totalDays;
    private long presentDays;
    private long absentDays;
    private long lateDays;
    private double attendancePercentage;
}
