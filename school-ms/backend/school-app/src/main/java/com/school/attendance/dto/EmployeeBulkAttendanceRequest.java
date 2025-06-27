package com.school.attendance.dto;

import com.school.attendance.model.EmployeeAttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Map;

/**
 * DTO for bulk attendance requests for the consolidated employee attendance system
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeBulkAttendanceRequest {
    
    @NotNull(message = "Date is required")
    private LocalDate attendanceDate;
    
    @NotEmpty(message = "Employee attendance map is required")
    private Map<Long, EmployeeAttendanceStatus> attendanceMap;
    
    private String remarks;
    
    private String employeeType; // Optional filter for TEACHING or NON_TEACHING staff
}
