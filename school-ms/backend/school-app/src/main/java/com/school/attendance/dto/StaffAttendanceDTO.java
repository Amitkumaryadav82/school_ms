package com.school.attendance.dto;

import com.school.attendance.model.StaffAttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffAttendanceDTO {
    private Long id;
    private Long staffId;
    private String staffName;
    private LocalDate attendanceDate;
    private StaffAttendanceStatus status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
