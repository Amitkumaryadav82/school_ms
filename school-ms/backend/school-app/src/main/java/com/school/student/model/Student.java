package com.school.student.model;

import com.school.admission.model.Admission;
import com.school.common.model.Auditable;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String studentId;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    @Past
    @NotNull
    private LocalDate dateOfBirth;

    @NotNull
    private Integer grade;

    @NotBlank
    private String section;

    @NotBlank
    private String contactNumber;

    private String address;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @NotBlank
    private String guardianName;

    @NotBlank
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

    @Column(columnDefinition = "TEXT")
    private String subjects;

    private String transportMode;

    private String busRouteNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StudentStatus status = StudentStatus.ACTIVE;

    private LocalDate admissionDate;

    private String photoUrl;

    private String bloodGroup;

    private String medicalConditions;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id", unique = true)
    private Admission admission;
}