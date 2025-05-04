package com.school.attendance.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyAttendanceReport {
    private Integer grade;
    private String section;
    private Integer year;
    private Integer month;
    private double averageAttendancePercentage;
    private List<StudentAttendanceDetail> studentDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendanceDetail {
        private Long studentId;
        private String studentName;
        private int presentDays;
        private int absentDays;
        private int lateDays;
        private double attendancePercentage;
    }
}