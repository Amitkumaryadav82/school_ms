package com.school.attendance.dto;

import com.school.attendance.model.AttendanceStatus;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class BulkAttendanceRequest {
    private List<Long> studentIds;
    private LocalDate date;
    private AttendanceStatus status;
    private String remarks;
}