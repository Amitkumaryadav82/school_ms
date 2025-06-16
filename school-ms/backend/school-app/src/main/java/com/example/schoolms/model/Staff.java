package com.example.schoolms.model;

import java.util.Date;

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
 * 
 * @deprecated This class is deprecated in favor of com.school.staff.model.Staff.
 * Please use the new class as part of the package consolidation effort.
 * See PACKAGE-MIGRATION-PLAN.md for more details.
 */
@Entity(name = "ExampleStaff")
@Table(name = "example_staff")
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

    private String phoneNumber;    private String address;
    
    @Column(nullable = false)
    private String role;
    
    @Column(name = "legacy_date_of_birth")
    private Date dateOfBirth;

    private Date joiningDate;

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
    }    /**
     * Get the staff's first name
     * @return the first name
     */
    public String getFirstName() {
        return this.firstName;
    }
    
    /**
     * Set the staff's first name
     * @param firstName the first name to set
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * Get the staff's middle name
     * @return the middle name
     */
    public String getMiddleName() {
        return this.middleName;
    }
    
    /**
     * Set the staff's middle name
     * @param middleName the middle name to set
     */
    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }

    /**
     * Get the staff's last name
     * @return the last name
     */
    public String getLastName() {
        return this.lastName;
    }
    
    /**
     * Set the staff's last name
     * @param lastName the last name to set
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    /**
     * Get the staff's email
     * @return the email
     */
    public String getEmail() {
        return this.email;
    }
    
    /**
     * Set the staff's email
     * @param email the email to set
     */
    public void setEmail(String email) {
        this.email = email;
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
    }    /**
     * Get the staff's role
     * @return the role
     */
    public String getRole() {
        return this.role;
    }
    
    /**
     * Set the staff's role
     * @param role the role to set
     */
    public void setRole(String role) {
        this.role = role;
    }

    /**
     * Get the staff's address
     * @return the address
     */
    public String getAddress() {
        return this.address;
    }
    
    /**
     * Set the staff's address
     * @param address the address to set
     */
    public void setAddress(String address) {
        this.address = address;
    }

    /**
     * Get the staff's date of birth
     * @return the date of birth
     */    public Date getDateOfBirth() {
        return this.dateOfBirth;
    }
    
    /**
     * Set the staff's date of birth
     * @param dateOfBirth the date of birth to set
     */
    public void setDateOfBirth(Date dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    /**
     * Get the staff's joining date
     * @return the joining date
     */    public Date getJoiningDate() {
        return this.joiningDate;
    }

    /**
     * Set the staff's joining date
     * @param joiningDate the joining date to set
     */
    public void setJoiningDate(Date joiningDate) {
        this.joiningDate = joiningDate;
    }

    /**
     * Get the staff's department
     * @return the department
     */
    public String getDepartment() {
        return this.department;
    }    /**
     * Check if the staff is active
     * @return true if active, false otherwise
     */
    public boolean isActive() {
        return this.active;
    }
    
    /**
     * Set the active status of the staff
     * @param active true if active, false otherwise
     */
    public void setActive(boolean active) {
        this.active = active;
    }
      /**
     * Set the staff's department
     * @param department the department to set
     */
    public void setDepartment(String department) {
        this.department = department;
    }
    
    /**
     * Get the staff's ID
     * @return the ID
     */
    public Long getId() {
        return this.id;
    }
    
    /**
     * Set the staff's ID
     * @param id the ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }
    
    /**
     * Get the teacher details
     * @return the teacher details
     */
    public TeacherDetails getTeacherDetails() {
        return this.teacherDetails;
    }
    
    /**
     * Set the teacher details
     * @param teacherDetails the teacher details to set
     */
    public void setTeacherDetails(TeacherDetails teacherDetails) {
        this.teacherDetails = teacherDetails;
    }
}
