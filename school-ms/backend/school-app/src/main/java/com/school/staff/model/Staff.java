package com.school.staff.model;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.CascadeType;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a staff member in the school.
 * This is the consolidated version migrated from com.example.schoolms.model.Staff
 * 
 * @deprecated This class is deprecated in favor of com.school.core.model.Staff.
 * Please use the consolidated entity as part of the entity consolidation effort.
 * See PACKAGE-MIGRATION-PLAN.md for more details.
 */
@Entity(name = "StaffModule")
@Table(name = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Deprecated
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String staffId;

    @Column(nullable = false)
    private String firstName;

    private String middleName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    private String phoneNumber;

    private String address;    @Column(nullable = false)
    private String role;    @Column(name = "staff_date_of_birth")
    private LocalDate dateOfBirth;

    private LocalDate joiningDate;    private String department;
    
    private String designation;

    @Column(nullable = false)
    private boolean active = true;

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

    // Explicit getter methods to ensure they're visible to the compiler
    public Long getId() { return this.id; }
    public String getStaffId() { return this.staffId; }
    public String getFirstName() { return this.firstName; }
    public String getMiddleName() { return this.middleName; }
    public String getLastName() { return this.lastName; }
    public String getEmail() { return this.email; }
    public String getPhone() { return this.phone; }
    public String getPhoneNumber() { return this.phoneNumber; }
    public String getAddress() { return this.address; }
    public String getRole() { return this.role; }
    public LocalDate getDateOfBirth() { return this.dateOfBirth; }
    public LocalDate getJoiningDate() { return this.joiningDate; }
    public String getDepartment() { return this.department; }
}
