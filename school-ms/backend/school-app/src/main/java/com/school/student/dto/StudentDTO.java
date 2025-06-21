package com.school.student.dto;

import com.school.student.model.Gender;
import com.school.student.model.StudentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Long id;

    /**
     * Static builder method
     * @return new StudentDTOBuilder instance
     */
    public static StudentDTOBuilder builder() {
        return new StudentDTOBuilder();
    }

    /**
     * Get the ID
     * @return the ID
     */
    public Long getId() {
        return this.id;
    }

    private String studentId;

    /**
     * Get the student ID
     * @return the student ID
     */
    public String getStudentId() {
        return this.studentId;
    }

    private String firstName;

    /**
     * Get the first name
     * @return the first name
     */
    public String getFirstName() {
        return this.firstName;
    }

    private String lastName;

    /**
     * Get the last name
     * @return the last name
     */
    public String getLastName() {
        return this.lastName;
    }

    private String email;

    /**
     * Get the email
     * @return the email
     */
    public String getEmail() {
        return this.email;
    }

    private LocalDate dateOfBirth;

    /**
     * Get the date of birth
     * @return the date of birth
     */
    public LocalDate getDateOfBirth() {
        return this.dateOfBirth;
    }

    private Integer grade;

    private String section;

    private String contactNumber;

    private String address;

    private Gender gender;

    private String guardianName;

    private String guardianContact;

    private String guardianEmail;

    private String guardianOccupation;

    private String guardianOfficeAddress;

    private String aadharNumber;

    private String udiseNumber;

    private String houseAlloted;

    private BigDecimal guardianAnnualIncome;

    private String previousSchool;

    private String tcNumber;

    private String tcReason;

    private LocalDate tcDate;

    private String whatsappNumber;

    private String subjects;

    private String transportMode;

    private String busRouteNumber;

    private StudentStatus status;

    private LocalDate admissionDate;

    private String photoUrl;

    private String bloodGroup;

    private String medicalConditions;
}