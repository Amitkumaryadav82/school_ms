package com.school.student.model;

import com.school.admission.model.Admission;
import com.school.common.model.Auditable;
import javax.persistence.*;
import javax.validation.constraints.*;
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
    @Column(unique = true)    private String studentId;
    
    private String rollNumber;

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
    private Admission admission;    /**
     * Get the id of the student
     * @return the student id
     */
    public Long getId() {
        return this.id;
    }
    
    /**
     * Get student email address
     * @return the email address
     */
    public String getEmail() {
        return this.email;
    }
    
    /**
     * Get student status
     * @return the student status
     */
    public StudentStatus getStatus() {
        return this.status;
    }
    
    /**
     * Get the student's full name
     * @return full name (first name + last name)
     */
    public String getFullName() {
        return this.firstName + " " + this.lastName;
    }
    
    /**
     * Get the admission date
     * @return the admission date
     */
    public LocalDate getAdmissionDate() {
        return this.admissionDate;
    }
    
    /**
     * Get the guardian email
     * @return the guardian email
     */
    public String getGuardianEmail() {
        return this.guardianEmail;
    }
    
    /**
     * Get the grade
     * @return student's grade
     */
    public Integer getGrade() {
        return this.grade;
    }
    
    /**
     * Get the section
     * @return student's section
     */
    public String getSection() {
        return this.section;
    }
}
