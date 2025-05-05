package com.school.admission.model;

import com.school.common.model.Auditable;
import com.school.student.model.Student;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "admissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admission extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private LocalDate applicationDate;

    @NotBlank
    private String applicantName;

    @NotNull
    @Past
    private LocalDate dateOfBirth;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String contactNumber;

    @NotBlank
    private String guardianName;

    @NotBlank
    private String guardianContact;

    private String guardianEmail;

    private String address;

    @NotNull
    private Integer gradeApplying;

    private String previousSchool;

    private String previousGrade;

    @NotNull
    @Min(value = 0)
    @Max(value = 100)
    private Double previousPercentage;

    @Lob
    private byte[] documents;

    private String documentsFormat;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AdmissionStatus status = AdmissionStatus.PENDING;

    private String rejectionReason;

    @OneToOne(mappedBy = "admission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Student student;

    public enum AdmissionStatus {
        PENDING,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        WAITLISTED,
        CANCELLED,
        ENROLLED
    }
}