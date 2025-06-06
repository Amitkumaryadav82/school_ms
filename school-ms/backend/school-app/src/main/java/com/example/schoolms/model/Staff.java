package com.example.schoolms.model;

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
 * Entity representing a staff member in the school
 */
@Entity(name = "ExampleStaff")
@Table(name = "example_staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    private String address;

    @Column(nullable = false)
    private String role;

    private LocalDate dateOfBirth;

    private LocalDate joiningDate;

    private String department;

    @Column(nullable = false)
    private boolean active = true;

    @OneToOne(cascade = CascadeType.ALL)
    private TeacherDetails teacherDetails;

    /**
     * Get the staff ID
     * @return the staff ID
     */
    public String getStaffId() {
        return this.staffId;
    }

    /**
     * Set the staff ID
     * @param staffId the staff ID to set
     */
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    /**
     * Get the staff's first name
     * @return the first name
     */
    public String getFirstName() {
        return this.firstName;
    }

    /**
     * Get the staff's last name
     * @return the last name
     */
    public String getLastName() {
        return this.lastName;
    }

    /**
     * Get the staff's email
     * @return the email
     */
    public String getEmail() {
        return this.email;
    }

    /**
     * Get the staff's phone
     * @return the phone
     */
    public String getPhone() {
        return this.phone;
    }

    /**
     * Set the staff's phone
     * @param phone the phone to set
     */
    public void setPhone(String phone) {
        this.phone = phone;
    }

    /**
     * Get the staff's phone number
     * @return the phone number
     */
    public String getPhoneNumber() {
        return this.phoneNumber;
    }

    /**
     * Set the staff's phone number
     * @param phoneNumber the phone number to set
     */
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    /**
     * Get the staff's role
     * @return the role
     */
    public String getRole() {
        return this.role;
    }

    /**
     * Get the staff's address
     * @return the address
     */
    public String getAddress() {
        return this.address;
    }

    /**
     * Get the staff's date of birth
     * @return the date of birth
     */
    public LocalDate getDateOfBirth() {
        return this.dateOfBirth;
    }

    /**
     * Get the staff's joining date
     * @return the joining date
     */
    public LocalDate getJoiningDate() {
        return this.joiningDate;
    }

    /**
     * Set the staff's joining date
     * @param joiningDate the joining date to set
     */
    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }

    /**
     * Get the staff's department
     * @return the department
     */
    public String getDepartment() {
        return this.department;
    }

    /**
     * Check if the staff is active
     * @return true if active, false otherwise
     */
    public boolean isActive() {
        return this.active;
    }
}
