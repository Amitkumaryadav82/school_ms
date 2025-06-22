package com.school.core.dto;

import com.school.core.model.EmploymentStatus;
import com.school.core.model.Staff;
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
    // Adding a string representation of the role for consistent display
    private String role;
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
    
    /**
     * Converts a Staff entity to StaffDTO with standardized role representation
     * 
     * @param staff The Staff entity to convert
     * @return A StaffDTO with consistent role representation
     */
    public static StaffDTO fromEntity(Staff staff) {
        if (staff == null) return null;
        
        // Get the most accurate role name available
        String roleName = null;
        if (staff.getRole() != null && staff.getRole().getName() != null) {
            roleName = staff.getRole().getName();
        } else {
            roleName = staff.getStringRole() != null ? staff.getStringRole() : "Unknown";
        }
        
        return StaffDTO.builder()
            .id(staff.getId())
            .staffId(staff.getStaffId())
            .firstName(staff.getFirstName())
            .lastName(staff.getLastName())
            .email(staff.getEmail())
            .phone(staff.getPhoneNumber())
            .department(staff.getDepartment())
            .employmentStatus(staff.getEmploymentStatus())
            .staffRole(staff.getRole())
            .role(roleName)  // Always a string
            .dateOfJoining(staff.getJoinDate())
            .dateOfBirth(staff.getDateOfBirth())
            .gender(staff.getGender())
            .address(staff.getAddress())
            .build();
    }
      // Method removed - not needed anymore as we're directly using the enum
}
