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

    /**
     * Explicit getId method
     * @return the ID of the student
     */
    public Long getId() {
        return this.id;
    }

    /**
     * Explicit setId method
     * @param id the ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    @NotBlank
    @Column(unique = true)    
    private String studentId;
    
    /**
     * Get the student ID
     * @return the student ID
     */
    public String getStudentId() {
        return this.studentId;
    }
    
    private String rollNumber;

    @NotBlank
    private String firstName;
    
    /**
     * Get the first name
     * @return the first name
     */
    public String getFirstName() {
        return this.firstName;
    }
    
    @NotBlank
    private String lastName;

    /**
     * Get the last name
     * @return the last name
     */
    public String getLastName() {
        return this.lastName;
    }
    
    @Email
    @Column(unique = true)
    private String email;
    
    /**
     * Get the email
     * @return the email
     */
    public String getEmail() {
        return this.email;
    }
    
    @Past
    @NotNull
    private LocalDate dateOfBirth;
    
    /**
     * Get the date of birth
     * @return the date of birth
     */
    public LocalDate getDateOfBirth() {
        return this.dateOfBirth;
    }

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
    
    /**
     * Get the guardian occupation
     * @return the guardian occupation
     */
    public String getGuardianOccupation() {
        return this.guardianOccupation;
    }
    
    /**
     * Get the guardian office address
     * @return the guardian office address
     */
    public String getGuardianOfficeAddress() {
        return this.guardianOfficeAddress;
    }
    
    private String aadharNumber;
    private String udiseNumber;
    private String houseAlloted;
    
    /**
     * Get the aadhar number
     * @return the aadhar number
     */
    public String getAadharNumber() {
        return this.aadharNumber;
    }
    
    /**
     * Get the UDISE number
     * @return the UDISE number
     */
    public String getUdiseNumber() {
        return this.udiseNumber;
    }
    
    /**
     * Get the house alloted
     * @return the house alloted
     */
    public String getHouseAlloted() {
        return this.houseAlloted;
    }
    
    private BigDecimal guardianAnnualIncome;
    private String previousSchool;
    private String tcNumber;
    private String tcReason;
    private LocalDate tcDate;
    private String whatsappNumber;
    private String subjects;
    
    /**
     * Get the guardian annual income
     * @return the guardian annual income
     */
    public BigDecimal getGuardianAnnualIncome() {
        return this.guardianAnnualIncome;
    }
    
    /**
     * Get the previous school
     * @return the previous school
     */
    public String getPreviousSchool() {
        return this.previousSchool;
    }
    
    /**
     * Get the TC number
     * @return the TC number
     */
    public String getTcNumber() {
        return this.tcNumber;
    }
    
    /**
     * Get the TC reason
     * @return the TC reason
     */
    public String getTcReason() {
        return this.tcReason;
    }
    
    /**
     * Get the TC date
     * @return the TC date
     */
    public LocalDate getTcDate() {
        return this.tcDate;
    }
    
    /**
     * Get the WhatsApp number
     * @return the WhatsApp number
     */
    public String getWhatsappNumber() {
        return this.whatsappNumber;
    }
    
    /**
     * Get the subjects
     * @return the subjects
     */
    public String getSubjects() {
        return this.subjects;
    }
    
    private String transportMode;
    private String busRouteNumber;
    
    // Adding missing field for JPA relationship with Admission
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id")
    private Admission admission;
    
    /**
     * Get the transport mode
     * @return the transport mode
     */
    public String getTransportMode() {
        return this.transportMode;
    }
    
    /**
     * Get the bus route number
     * @return the bus route number
     */
    public String getBusRouteNumber() {
        return this.busRouteNumber;
    }
    
    @Enumerated(EnumType.STRING)
    private StudentStatus status;
    private LocalDate admissionDate;
    
    /**
     * Get the status
     * @return the status
     */
    public StudentStatus getStatus() {
        return this.status;
    }
    
    /**
     * Get the admission date
     * @return the admission date
     */
    public LocalDate getAdmissionDate() {
        return this.admissionDate;
    }
      private String photoUrl;
    private String bloodGroup;
    private String medicalConditions;
    
    /**
     * Get the photo URL
     * @return the photo URL
     */
    public String getPhotoUrl() {
        return this.photoUrl;
    }
    
    /**
     * Get the blood group
     * @return the blood group
     */
    public String getBloodGroup() {
        return this.bloodGroup;
    }
    
    /**
     * Get the medical conditions
     * @return the medical conditions
     */
    public String getMedicalConditions() {
        return this.medicalConditions;
    }
    
    /**
     * Get the admission
     * @return the admission
     */
    public Admission getAdmission() {
        return this.admission;
    }
    
    /**
     * Set the admission
     * @param admission the admission to set
     */
    public void setAdmission(Admission admission) {
        this.admission = admission;
    }
    
    /**
     * Static builder method
     * @return a new StudentBuilder
     */
    public static StudentBuilder builder() {
        return new StudentBuilder();
    }
}
