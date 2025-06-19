package com.school.core.dto;

import com.school.core.model.EmploymentStatus;
import com.school.core.model.StaffRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * Data Transfer Object for the Staff entity.
 * Used to transfer staff data between the API layer and the service layer.
 * Consolidated from various legacy DTOs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDTO {
    private Long id;
    private String staffId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String designation;
    private String department;
    private EmploymentStatus employmentStatus;
    private StaffRole staffRole;
    private LocalDate dateOfJoining;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String emergencyContactName;
    private String emergencyContactPhone;
}
