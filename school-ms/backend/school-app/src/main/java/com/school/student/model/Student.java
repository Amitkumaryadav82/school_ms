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
     * Get the student's full name
     * @return full name (first name + last name)
     */
    public String getFullName() {
        return this.firstName + " " + this.lastName;
    }
    
    // Explicit getters and setters for critical fields
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public StudentStatus getStatus() { return this.status; }
    public void setStatus(StudentStatus status) { this.status = status; }
    
    public LocalDate getAdmissionDate() { return this.admissionDate; }
    public void setAdmissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; }
    
    public String getEmail() { return this.email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return this.firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return this.lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public LocalDate getDateOfBirth() { return this.dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public Integer getGrade() { return this.grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
    
    public String getSection() { return this.section; }
    public void setSection(String section) { this.section = section; }
    
    public String getContactNumber() { return this.contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    
    public String getAddress() { return this.address; }
    public void setAddress(String address) { this.address = address; }
    
    public Gender getGender() { return this.gender; }
    public void setGender(Gender gender) { this.gender = gender; }
    
    public String getGuardianName() { return this.guardianName; }
    public void setGuardianName(String guardianName) { this.guardianName = guardianName; }
    
    public String getGuardianContact() { return this.guardianContact; }
    public void setGuardianContact(String guardianContact) { this.guardianContact = guardianContact; }
    
    public String getGuardianEmail() { return this.guardianEmail; }
    public void setGuardianEmail(String guardianEmail) { this.guardianEmail = guardianEmail; }
    
    public String getGuardianOccupation() { return this.guardianOccupation; }
    public void setGuardianOccupation(String guardianOccupation) { this.guardianOccupation = guardianOccupation; }
    
    public String getGuardianOfficeAddress() { return this.guardianOfficeAddress; }
    public void setGuardianOfficeAddress(String guardianOfficeAddress) { this.guardianOfficeAddress = guardianOfficeAddress; }
    
    public String getAadharNumber() { return this.aadharNumber; }
    public void setAadharNumber(String aadharNumber) { this.aadharNumber = aadharNumber; }
    
    public String getUdiseNumber() { return this.udiseNumber; }
    public void setUdiseNumber(String udiseNumber) { this.udiseNumber = udiseNumber; }
    
    public String getHouseAlloted() { return this.houseAlloted; }
    public void setHouseAlloted(String houseAlloted) { this.houseAlloted = houseAlloted; }
    
    public BigDecimal getGuardianAnnualIncome() { return this.guardianAnnualIncome; }
    public void setGuardianAnnualIncome(BigDecimal guardianAnnualIncome) { this.guardianAnnualIncome = guardianAnnualIncome; }
    
    public String getPreviousSchool() { return this.previousSchool; }
    public void setPreviousSchool(String previousSchool) { this.previousSchool = previousSchool; }
    
    public String getTcNumber() { return this.tcNumber; }
    public void setTcNumber(String tcNumber) { this.tcNumber = tcNumber; }
    
    public String getTcReason() { return this.tcReason; }
    public void setTcReason(String tcReason) { this.tcReason = tcReason; }
    
    public LocalDate getTcDate() { return this.tcDate; }
    public void setTcDate(LocalDate tcDate) { this.tcDate = tcDate; }
    
    public String getWhatsappNumber() { return this.whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }
    
    public String getSubjects() { return this.subjects; }
    public void setSubjects(String subjects) { this.subjects = subjects; }
    
    public String getTransportMode() { return this.transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }
    
    public String getBusRouteNumber() { return this.busRouteNumber; }
    public void setBusRouteNumber(String busRouteNumber) { this.busRouteNumber = busRouteNumber; }
    
    public String getPhotoUrl() { return this.photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    
    public String getBloodGroup() { return this.bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    
    public String getMedicalConditions() { return this.medicalConditions; }
    public void setMedicalConditions(String medicalConditions) { this.medicalConditions = medicalConditions; }
    
    public Admission getAdmission() { return this.admission; }
    public void setAdmission(Admission admission) { this.admission = admission; }
    
    public String getRollNumber() { return this.rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    
    // Static builder method in case Lombok fails
    public static StudentBuilder builder() {
        return new StudentBuilder();
    }
    
    // Manual builder implementation
    public static class StudentBuilder {
        private Long id;
        private String studentId;
        private String rollNumber;
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
        private StudentStatus status = StudentStatus.ACTIVE;
        private LocalDate admissionDate;
        private String photoUrl;
        private String bloodGroup;
        private String medicalConditions;
        private Admission admission;
        
        public StudentBuilder id(Long id) { this.id = id; return this; }
        public StudentBuilder studentId(String studentId) { this.studentId = studentId; return this; }
        public StudentBuilder rollNumber(String rollNumber) { this.rollNumber = rollNumber; return this; }
        public StudentBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public StudentBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public StudentBuilder email(String email) { this.email = email; return this; }
        public StudentBuilder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public StudentBuilder grade(Integer grade) { this.grade = grade; return this; }
        public StudentBuilder section(String section) { this.section = section; return this; }
        public StudentBuilder contactNumber(String contactNumber) { this.contactNumber = contactNumber; return this; }
        public StudentBuilder address(String address) { this.address = address; return this; }
        public StudentBuilder gender(Gender gender) { this.gender = gender; return this; }
        public StudentBuilder guardianName(String guardianName) { this.guardianName = guardianName; return this; }
        public StudentBuilder guardianContact(String guardianContact) { this.guardianContact = guardianContact; return this; }
        public StudentBuilder guardianEmail(String guardianEmail) { this.guardianEmail = guardianEmail; return this; }
        public StudentBuilder guardianOccupation(String guardianOccupation) { this.guardianOccupation = guardianOccupation; return this; }
        public StudentBuilder guardianOfficeAddress(String guardianOfficeAddress) { this.guardianOfficeAddress = guardianOfficeAddress; return this; }
        public StudentBuilder aadharNumber(String aadharNumber) { this.aadharNumber = aadharNumber; return this; }
        public StudentBuilder udiseNumber(String udiseNumber) { this.udiseNumber = udiseNumber; return this; }
        public StudentBuilder houseAlloted(String houseAlloted) { this.houseAlloted = houseAlloted; return this; }
        public StudentBuilder guardianAnnualIncome(BigDecimal guardianAnnualIncome) { this.guardianAnnualIncome = guardianAnnualIncome; return this; }
        public StudentBuilder previousSchool(String previousSchool) { this.previousSchool = previousSchool; return this; }
        public StudentBuilder tcNumber(String tcNumber) { this.tcNumber = tcNumber; return this; }
        public StudentBuilder tcReason(String tcReason) { this.tcReason = tcReason; return this; }
        public StudentBuilder tcDate(LocalDate tcDate) { this.tcDate = tcDate; return this; }
        public StudentBuilder whatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; return this; }
        public StudentBuilder subjects(String subjects) { this.subjects = subjects; return this; }
        public StudentBuilder transportMode(String transportMode) { this.transportMode = transportMode; return this; }
        public StudentBuilder busRouteNumber(String busRouteNumber) { this.busRouteNumber = busRouteNumber; return this; }
        public StudentBuilder status(StudentStatus status) { this.status = status; return this; }
        public StudentBuilder admissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; return this; }
        public StudentBuilder photoUrl(String photoUrl) { this.photoUrl = photoUrl; return this; }
        public StudentBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public StudentBuilder medicalConditions(String medicalConditions) { this.medicalConditions = medicalConditions; return this; }
        public StudentBuilder admission(Admission admission) { this.admission = admission; return this; }
        
        public Student build() {
            Student student = new Student();
            student.id = this.id;
            student.studentId = this.studentId;
            student.rollNumber = this.rollNumber;
            student.firstName = this.firstName;
            student.lastName = this.lastName;
            student.email = this.email;
            student.dateOfBirth = this.dateOfBirth;
            student.grade = this.grade;
            student.section = this.section;
            student.contactNumber = this.contactNumber;
            student.address = this.address;
            student.gender = this.gender;
            student.guardianName = this.guardianName;
            student.guardianContact = this.guardianContact;
            student.guardianEmail = this.guardianEmail;
            student.guardianOccupation = this.guardianOccupation;
            student.guardianOfficeAddress = this.guardianOfficeAddress;
            student.aadharNumber = this.aadharNumber;
            student.udiseNumber = this.udiseNumber;
            student.houseAlloted = this.houseAlloted;
            student.guardianAnnualIncome = this.guardianAnnualIncome;
            student.previousSchool = this.previousSchool;
            student.tcNumber = this.tcNumber;
            student.tcReason = this.tcReason;
            student.tcDate = this.tcDate;
            student.whatsappNumber = this.whatsappNumber;
            student.subjects = this.subjects;
            student.transportMode = this.transportMode;
            student.busRouteNumber = this.busRouteNumber;
            student.status = this.status;
            student.admissionDate = this.admissionDate;
            student.photoUrl = this.photoUrl;
            student.bloodGroup = this.bloodGroup;
            student.medicalConditions = this.medicalConditions;
            student.admission = this.admission;
            return student;
        }
    }
}
