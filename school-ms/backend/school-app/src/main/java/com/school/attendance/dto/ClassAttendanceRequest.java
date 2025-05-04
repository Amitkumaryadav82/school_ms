package com.school.attendance.dto;

import com.school.attendance.model.AttendanceStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ClassAttendanceRequest {
    private Integer grade;
    private String section;
    private LocalDate date;
    private AttendanceStatus defaultStatus;
    private String remarks;
}