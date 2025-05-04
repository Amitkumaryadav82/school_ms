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
public class MonthlyAttendanceStats {
    private Integer grade;
    private String section;
    private Integer year;
    private Integer month;
    private List<String> studentsWith100Percent;
    private List<String> studentsBelow75Percent;
    private int totalStudents;
    private int averageAttendance;
}