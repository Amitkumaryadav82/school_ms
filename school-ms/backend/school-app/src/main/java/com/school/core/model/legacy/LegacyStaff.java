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
    
    // Explicit getter methods
    public Long getId() { return this.id; }
    public String getStaffId() { return this.staffId; }
    public String getFirstName() { return this.firstName; }
    public String getLastName() { return this.lastName; }
    public String getEmail() { return this.email; }
    public String getPhone() { return this.phone; }
    public String getAddress() { return this.address; }
    public String getRole() { return this.role; }
    public Date getDateOfBirth() { return this.dateOfBirth; }
    public Date getJoiningDate() { return this.joiningDate; }
    public String getDepartment() { return this.department; }
    public boolean isActive() { return this.active; }
    public String getGender() { return this.gender; }
    public LegacyTeacherDetails getTeacherDetails() { return this.teacherDetails; }
}
