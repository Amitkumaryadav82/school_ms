package com.school.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkAttendanceRequestDTO {
    private LocalDate date;
    private List<SingleAttendanceDTO> attendanceRecords;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SingleAttendanceDTO {
        private Long employeeId;
        private String status;
        private String reason;
    }
}
