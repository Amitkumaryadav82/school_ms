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

    private String studentId;

    private String firstName;

    private String lastName;

    private String email;

    private LocalDate dateOfBirth;

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