package com.school.hrm.dto;

import com.school.hrm.model.EmployeeRole;
import com.school.hrm.model.EmploymentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class EmployeeDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private EmployeeRole role;
    private String department;
    private LocalDate joiningDate;
    private LocalDate terminationDate;
    private EmploymentStatus status;
    private Double salary;
}