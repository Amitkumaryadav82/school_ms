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

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.school.hrm.model.EmploymentStatus;
import com.school.hrm.entity.StaffRole;
import com.school.core.model.TeacherDetails;

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

    @Column(name = "staff_id", unique = true, nullable = false)
    private String staffId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private String gender;

    @Column(name = "join_date")
    private LocalDate joinDate;
    
    // Legacy field maintained for backward compatibility
    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "termination_date")
    private LocalDate terminationDate;

    @Column(name = "department")
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status")
    private EmploymentStatus employmentStatus = EmploymentStatus.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private StaffRole staffRole;
    
    // Legacy role field maintained for backward compatibility
    @Column(name = "role")
    private String role;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    // Legacy active field maintained for backward compatibility
    @Column(name = "active", nullable = false)
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
    private TeacherDetails teacherDetails;

    /**
     * Get the full name of the staff member
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
}
