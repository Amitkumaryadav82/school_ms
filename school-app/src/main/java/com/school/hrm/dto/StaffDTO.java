package com.school.hrm.dto;

import java.time.LocalDate;
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
    private String email;
    private String phoneNumber;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;
    private LocalDate joinDate;
    private LocalDate terminationDate;
    private String employmentStatus;
    private Long roleId;
    private String roleName;
    private Long userId;
}
