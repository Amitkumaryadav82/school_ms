package com.school.attendance.dto;

import com.school.attendance.model.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long studentId;
    private LocalDate date;
    private AttendanceStatus status;
    private String remarks;
}