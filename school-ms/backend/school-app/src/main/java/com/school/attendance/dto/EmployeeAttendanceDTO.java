package com.school.attendance.dto;

import com.school.attendance.model.EmployeeAttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for consolidated employee attendance (both teaching and non-teaching staff)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAttendanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String department;
    private String position;
    private String employeeType; // TEACHING or NON_TEACHING
    private LocalDate attendanceDate;
    private EmployeeAttendanceStatus status;
    private String reason;
    private String remarks;
    private String markedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
