package com.school.core.model.legacy;

import java.util.Date;
import lombok.Data;

/**
 * A simplified version of the legacy Staff class for migration purposes.
 * This replaces references to com.example.schoolms.model.Staff 
 */
@Data
public class LegacyStaff {
    private Long id;
    private String staffId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String phone;
    private String phoneNumber;    private String address;
    private String role;
    private Date dateOfBirth;
    private Date joiningDate;
    private String department;
    private boolean active;
    private String gender;
    
    // Reference to teacher details
    private LegacyTeacherDetails teacherDetails;
    
    // Default constructor
    public LegacyStaff() {}
}
