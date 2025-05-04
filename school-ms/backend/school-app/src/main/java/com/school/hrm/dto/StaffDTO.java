package com.school.hrm.dto;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(Include.NON_NULL)
public class StaffDTO {
    private Long id;
    private String staffId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;
    private LocalDate joinDate;
    private String role;
    private Long roleId;
    private Boolean isActive;
    private String qualifications;
    private String emergencyContact;
    private String bloodGroup;
    private String profileImage;

    // Teacher-specific fields
    private TeacherDetailsDTO teacherDetails;

    // List of designations
    private List<StaffDesignationDTO> designations;
}