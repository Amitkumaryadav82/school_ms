package com.school.admission.dto;

import javax.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AdmissionRequest {
    @NotBlank(message = "Applicant name is required")
    private String applicantName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    @NotBlank(message = "Guardian name is required")
    private String guardianName;

    @NotBlank(message = "Guardian contact is required")
    private String guardianContact;

    private String guardianEmail;

    private String address;

    @NotNull(message = "Grade applying for is required")
    private Integer gradeApplying;

    private String previousSchool;

    private String previousGrade;    @NotBlank(message = "Previous percentage is required")
    private String previousPercentage;
    
    // Additional information fields
    private String bloodGroup;
    
    private String medicalConditions;

    private byte[] documents;

    private String documentsFormat;
}
