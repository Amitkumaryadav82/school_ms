package com.school.core.dto;

import com.school.core.model.EmploymentStatus;
import com.school.core.model.Staff;
import com.school.core.model.StaffRole;
import com.school.core.model.TeacherDetails;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * Data Transfer Object for the Staff entity.
 * Used to transfer staff data between the API layer and the service layer.
 * Consolidated from various legacy DTOs with ALL necessary fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDTO {
    private Long id;
    private String staffId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String phone;
    private String phoneNumber;
    private String designation;
    private String department;
    private EmploymentStatus employmentStatus;
    private StaffRole staffRole;
    // Adding a string representation of the role for consistent display
    private String role;
    private LocalDate dateOfJoining;
    private LocalDate joinDate;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    
    // Staff Professional Details
    private String qualifications;
    private String emergencyContact;
    private String bloodGroup;
    private String profileImage;
    
    // PF, Gratuity, and Service Details
    private String pfUAN;
    private String gratuity;
    private LocalDate serviceEndDate;
    private LocalDate terminationDate;
    
    // Salary Details
    private Double basicSalary;
    private Double hra;
    private Double da;
    
    // Teacher-specific details
    private TeacherDetails teacherDetails;
    
    // Active status
    private Boolean isActive;
      /**
     * Converts a Staff entity to StaffDTO with standardized role representation
     * and all required fields mapped properly.
     * 
     * @param staff The Staff entity to convert
     * @return A StaffDTO with all necessary fields populated
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
            .middleName(staff.getMiddleName())
            .lastName(staff.getLastName())
            .email(staff.getEmail())
            .phone(staff.getPhone())
            .phoneNumber(staff.getPhoneNumber())
            .designation(staff.getDesignation())
            .department(staff.getDepartment())
            .employmentStatus(staff.getEmploymentStatus())
            .staffRole(staff.getRole())
            .role(roleName)  // Always a string
            .dateOfJoining(staff.getDateOfJoining())
            .joinDate(staff.getJoinDate())
            .dateOfBirth(staff.getDateOfBirth())
            .gender(staff.getGender())
            .address(staff.getAddress())
            // Additional details that were previously missing
            .qualifications(staff.getQualifications())
            .emergencyContact(staff.getEmergencyContact())
            .bloodGroup(staff.getBloodGroup())
            .profileImage(staff.getProfileImage())
            .pfUAN(staff.getPfUAN())
            .gratuity(staff.getGratuity())
            .serviceEndDate(staff.getServiceEndDate())
            .terminationDate(staff.getTerminationDate())
            .basicSalary(staff.getBasicSalary())
            .hra(staff.getHra())
            .da(staff.getDa())
            .teacherDetails(staff.getTeacherDetails())
            .isActive(staff.getIsActive())
            .build();
    }
      // Method removed - not needed anymore as we're directly using the enum
}
