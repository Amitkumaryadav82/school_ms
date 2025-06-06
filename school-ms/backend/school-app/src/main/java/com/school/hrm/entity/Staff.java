package com.school.hrm.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.school.hrm.model.EmploymentStatus;

@Entity
@Table(name = "staff")
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

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    @Column(name = "termination_date")
    private LocalDate terminationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status")
    private EmploymentStatus employmentStatus = EmploymentStatus.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private StaffRole role;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "is_active")
    private Boolean isActive = true;

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

    @Column(name = "ta")
    private Double ta;

    @Column(name = "other_allowances")
    private Double otherAllowances;

    @Column(name = "pf_contribution")
    private Double pfContribution;

    @Column(name = "tax_deduction")
    private Double taxDeduction;

    @Column(name = "net_salary")
    private Double netSalary;

    @Column(name = "salary_account_number")
    private String salaryAccountNumber;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "ifsc_code")
    private String ifscCode;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper method to get full name
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
