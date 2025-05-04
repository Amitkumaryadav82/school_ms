package com.school.attendance.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttendanceAlert {
    private Long studentId;
    private String studentName;
    private Integer grade;
    private String section;
    private String alertLevel;
    private String message;
    private double attendancePercentage;
    private int consecutiveAbsences;
    private int totalAbsences;
}