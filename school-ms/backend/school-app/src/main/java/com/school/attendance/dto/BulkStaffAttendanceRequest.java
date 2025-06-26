package com.school.attendance.dto;

import com.school.attendance.model.StaffAttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkStaffAttendanceRequest {
    
    @NotNull(message = "Date is required")
    private LocalDate attendanceDate;
    
    @NotEmpty(message = "Staff attendance map is required")
    private Map<Long, StaffAttendanceStatus> staffAttendanceMap;
    
    private String note;
}
