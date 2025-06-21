package com.school.hrm.dto;

import com.school.hrm.model.EmploymentStatus;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @deprecated This class is deprecated in favor of com.school.core.dto.StaffDTO.
 * Please use the consolidated DTO as part of the entity consolidation effort.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Deprecated
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
    private LocalDate terminationDate;
    private String employmentStatus;
    private String department;
    private String designation;
    private Long roleId;
    private String roleName;
    private String role;
    private Long userId;
    private Boolean isActive;
    private String qualifications;
    private String emergencyContact;
    private String bloodGroup;
    private String profileImage;
    private TeacherDetailsDTO teacherDetails;
}
