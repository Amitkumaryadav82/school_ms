package com.school.core.model;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.CascadeType;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Consolidated Staff entity that combines all fields from both:
 * - com.school.hrm.entity.Staff
 * - com.school.staff.model.Staff
 * 
 * This is the single source of truth for staff data in the application.
 */
@Entity(name = "CoreStaff")
@Table(name = "school_staff")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(name = "staff_id", unique = true, nullable = false)
    private String staffId;

    public String getStaffId() {
        return this.staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    @Column(name = "first_name", nullable = false)
    private String firstName;

    public String getFirstName() {
        return this.firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    @Column(name = "middle_name")
    private String middleName;

    public String getMiddleName() {
        return this.middleName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }

    @Column(name = "last_name", nullable = false)
    private String lastName;

    public String getLastName() {
        return this.lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    @Column(nullable = false, unique = true)
    private String email;

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Column(name = "phone")
    private String phone;

    public String getPhone() {
        return this.phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @Column(name = "phone_number")
    private String phoneNumber;

    public String getPhoneNumber() {
        return this.phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @Column(columnDefinition = "TEXT")
    private String address;

    public String getAddress() {
        return this.address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    public LocalDate getDateOfBirth() {
        return this.dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    @Column(name = "gender")
    private String gender;

    public String getGender() {
        return this.gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    @Column(name = "join_date")
    private LocalDate joinDate;

    // Legacy field maintained for backward compatibility
    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "termination_date")
    private LocalDate terminationDate;
    @Column(name = "department")
    private String department;

    public String getDepartment() {
        return this.department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    @Column(name = "designation")
    private String designation;

    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining;

    public String getDesignation() {
        return this.designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public LocalDate getDateOfJoining() {
        return this.dateOfJoining;
    }

    public void setDateOfJoining(LocalDate dateOfJoining) {
        this.dateOfJoining = dateOfJoining;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status")
    @Builder.Default
    private EmploymentStatus employmentStatus = EmploymentStatus.ACTIVE;

    public EmploymentStatus getEmploymentStatus() {
        return this.employmentStatus;
    }

    public void setEmploymentStatus(EmploymentStatus employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    @ManyToOne
    @JoinColumn(name = "role_id")
    private StaffRole staffRole;

    public StaffRole getRole() {
        return this.staffRole;
    }

    public void setRole(StaffRole staffRole) {
        this.staffRole = staffRole;
    }

    // Backward compatibility for code calling getStaffRole()
    public StaffRole getStaffRole() {
        return this.staffRole;
    }

    // Legacy role field maintained for backward compatibility
    @Column(name = "role")
    private String role;

    public String getStringRole() {
        return this.role;
    }

    public void setStringRole(String role) {
        this.role = role;
    }

    /**
     * Gets the normalized role name as a string.
     * Prefers the staffRole object's name if available, falls back to the legacy
     * role field.
     * 
     * @return The normalized role name as a string
     */
    public String getRoleString() {
        if (this.staffRole != null && this.staffRole.getName() != null) {
            return this.staffRole.getName();
        }
        return this.role;
    }

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Legacy active field maintained for backward compatibility
    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String qualifications;

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "pf_uan")
    private String pfUAN;

    @Column(name = "gratuity")
    private String gratuity;

    @Column(name = "service_end_date")
    private LocalDate serviceEndDate;

    @Column(name = "basic_salary")
    private Double basicSalary;

    @Column(name = "hra")
    private Double hra;

    @Column(name = "da")
    private Double da;

    @OneToOne(cascade = CascadeType.ALL)
    @JsonManagedReference
    private TeacherDetails teacherDetails;

    public TeacherDetails getTeacherDetails() {
        return this.teacherDetails;
    }

    public void setTeacherDetails(TeacherDetails teacherDetails) {
        this.teacherDetails = teacherDetails;
    }

    /**
     * Get the full name of the staff member
     * 
     * @return The full name (first name + middle name + last name)
     */
    public String getFullName() {
        if (middleName != null && !middleName.trim().isEmpty()) {
            return firstName + " " + middleName + " " + lastName;
        } else {
            return firstName + " " + lastName;
        }
    }

    /**
     * For backward compatibility with code that checks the active boolean field
     */
    @Transient
    public boolean isActive() {
        return this.isActive != null ? this.isActive : this.active;
    }

    /**
     * For backward compatibility with code that uses the active field
     */
    public void setActive(boolean active) {
        this.active = active;
        this.isActive = active;
    }

    /**
     * For backward compatibility with code that uses the isActive field
     */
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
        this.active = isActive != null ? isActive : true;
    }

    // Explicit getter for Boolean isActive (needed because isActive() boolean
    // method exists)
    public Boolean getIsActive() {
        return this.isActive;
    }

    /**
     * For backward compatibility between joinDate and joiningDate
     */
    @Transient
    public LocalDate getJoiningDate() {
        return this.joiningDate != null ? this.joiningDate : this.joinDate;
    }

    /**
     * For backward compatibility between joinDate and joiningDate
     */
    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
        if (this.joinDate == null) {
            this.joinDate = joiningDate;
        }
    }

    /**
     * For backward compatibility between joinDate and joiningDate
     */
    public void setJoinDate(LocalDate joinDate) {
        this.joinDate = joinDate;
        if (this.joiningDate == null) {
            this.joiningDate = joinDate;
        }
    }

    // Explicit getter for joinDate (DTO mapping expects it)
    public LocalDate getJoinDate() {
        return this.joinDate;
    }

    // Explicit getters for fields used in DTO mapping (defensive in case Lombok
    // processing is disabled)
    public String getQualifications() {
        return this.qualifications;
    }

    public String getEmergencyContact() {
        return this.emergencyContact;
    }

    public String getBloodGroup() {
        return this.bloodGroup;
    }

    public String getProfileImage() {
        return this.profileImage;
    }

    public String getPfUAN() {
        return this.pfUAN;
    }

    public String getGratuity() {
        return this.gratuity;
    }

    public LocalDate getServiceEndDate() {
        return this.serviceEndDate;
    }

    public LocalDate getTerminationDate() {
        return this.terminationDate;
    }

    public Double getBasicSalary() {
        return this.basicSalary;
    }

    public Double getHra() {
        return this.hra;
    }

    public Double getDa() {
        return this.da;
    }
}
