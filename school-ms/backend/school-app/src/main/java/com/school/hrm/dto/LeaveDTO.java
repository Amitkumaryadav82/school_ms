package com.school.hrm.dto;

import com.school.hrm.model.LeaveStatus;
import com.school.hrm.model.LeaveType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class LeaveDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LeaveType type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private LeaveStatus status;
    private String comments;
    private Long approvedById;
    private String approvedByName;
    private LocalDate approvalDate;
}