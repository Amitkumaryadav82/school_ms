package com.school.student.dto;

import com.school.student.model.Gender;
import com.school.student.model.StudentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

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

    // Explicit getters and setters for all fields to replace Lombok functionality
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
    
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }
    
    public String getGuardianName() { return guardianName; }
    public void setGuardianName(String guardianName) { this.guardianName = guardianName; }
    
    public String getGuardianContact() { return guardianContact; }
    public void setGuardianContact(String guardianContact) { this.guardianContact = guardianContact; }
    
    public String getGuardianEmail() { return guardianEmail; }
    public void setGuardianEmail(String guardianEmail) { this.guardianEmail = guardianEmail; }
    
    public String getGuardianOccupation() { return guardianOccupation; }
    public void setGuardianOccupation(String guardianOccupation) { this.guardianOccupation = guardianOccupation; }
    
    public String getGuardianOfficeAddress() { return guardianOfficeAddress; }
    public void setGuardianOfficeAddress(String guardianOfficeAddress) { this.guardianOfficeAddress = guardianOfficeAddress; }
    
    public String getAadharNumber() { return aadharNumber; }
    public void setAadharNumber(String aadharNumber) { this.aadharNumber = aadharNumber; }
    
    public String getUdiseNumber() { return udiseNumber; }
    public void setUdiseNumber(String udiseNumber) { this.udiseNumber = udiseNumber; }
    
    public String getHouseAlloted() { return houseAlloted; }
    public void setHouseAlloted(String houseAlloted) { this.houseAlloted = houseAlloted; }
    
    public BigDecimal getGuardianAnnualIncome() { return guardianAnnualIncome; }
    public void setGuardianAnnualIncome(BigDecimal guardianAnnualIncome) { this.guardianAnnualIncome = guardianAnnualIncome; }
    
    public String getPreviousSchool() { return previousSchool; }
    public void setPreviousSchool(String previousSchool) { this.previousSchool = previousSchool; }
    
    public String getTcNumber() { return tcNumber; }
    public void setTcNumber(String tcNumber) { this.tcNumber = tcNumber; }
    
    public String getTcReason() { return tcReason; }
    public void setTcReason(String tcReason) { this.tcReason = tcReason; }
    
    public LocalDate getTcDate() { return tcDate; }
    public void setTcDate(LocalDate tcDate) { this.tcDate = tcDate; }
    
    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }
    
    public String getSubjects() { return subjects; }
    public void setSubjects(String subjects) { this.subjects = subjects; }
    
    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }
    
    public String getBusRouteNumber() { return busRouteNumber; }
    public void setBusRouteNumber(String busRouteNumber) { this.busRouteNumber = busRouteNumber; }
    
    public StudentStatus getStatus() { return status; }
    public void setStatus(StudentStatus status) { this.status = status; }
    
    public LocalDate getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; }
    
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    
    public String getMedicalConditions() { return medicalConditions; }
    public void setMedicalConditions(String medicalConditions) { this.medicalConditions = medicalConditions; }
    
    // Static builder method in case Lombok builder isn't working
    public static StudentDTOBuilder builder() {
        return new StudentDTOBuilder();
    }

    // Manual builder implementation
    public static class StudentDTOBuilder {
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
        
        public StudentDTOBuilder id(Long id) { this.id = id; return this; }
        public StudentDTOBuilder studentId(String studentId) { this.studentId = studentId; return this; }
        public StudentDTOBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public StudentDTOBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public StudentDTOBuilder email(String email) { this.email = email; return this; }
        public StudentDTOBuilder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public StudentDTOBuilder grade(Integer grade) { this.grade = grade; return this; }
        public StudentDTOBuilder section(String section) { this.section = section; return this; }
        public StudentDTOBuilder contactNumber(String contactNumber) { this.contactNumber = contactNumber; return this; }
        public StudentDTOBuilder address(String address) { this.address = address; return this; }
        public StudentDTOBuilder gender(Gender gender) { this.gender = gender; return this; }
        public StudentDTOBuilder guardianName(String guardianName) { this.guardianName = guardianName; return this; }
        public StudentDTOBuilder guardianContact(String guardianContact) { this.guardianContact = guardianContact; return this; }
        public StudentDTOBuilder guardianEmail(String guardianEmail) { this.guardianEmail = guardianEmail; return this; }
        public StudentDTOBuilder guardianOccupation(String guardianOccupation) { this.guardianOccupation = guardianOccupation; return this; }
        public StudentDTOBuilder guardianOfficeAddress(String guardianOfficeAddress) { this.guardianOfficeAddress = guardianOfficeAddress; return this; }
        public StudentDTOBuilder aadharNumber(String aadharNumber) { this.aadharNumber = aadharNumber; return this; }
        public StudentDTOBuilder udiseNumber(String udiseNumber) { this.udiseNumber = udiseNumber; return this; }
        public StudentDTOBuilder houseAlloted(String houseAlloted) { this.houseAlloted = houseAlloted; return this; }
        public StudentDTOBuilder guardianAnnualIncome(BigDecimal guardianAnnualIncome) { this.guardianAnnualIncome = guardianAnnualIncome; return this; }
        public StudentDTOBuilder previousSchool(String previousSchool) { this.previousSchool = previousSchool; return this; }
        public StudentDTOBuilder tcNumber(String tcNumber) { this.tcNumber = tcNumber; return this; }
        public StudentDTOBuilder tcReason(String tcReason) { this.tcReason = tcReason; return this; }
        public StudentDTOBuilder tcDate(LocalDate tcDate) { this.tcDate = tcDate; return this; }
        public StudentDTOBuilder whatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; return this; }
        public StudentDTOBuilder subjects(String subjects) { this.subjects = subjects; return this; }
        public StudentDTOBuilder transportMode(String transportMode) { this.transportMode = transportMode; return this; }
        public StudentDTOBuilder busRouteNumber(String busRouteNumber) { this.busRouteNumber = busRouteNumber; return this; }
        public StudentDTOBuilder status(StudentStatus status) { this.status = status; return this; }
        public StudentDTOBuilder admissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; return this; }
        public StudentDTOBuilder photoUrl(String photoUrl) { this.photoUrl = photoUrl; return this; }
        public StudentDTOBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public StudentDTOBuilder medicalConditions(String medicalConditions) { this.medicalConditions = medicalConditions; return this; }
        
        public StudentDTO build() {
            StudentDTO dto = new StudentDTO();
            dto.id = this.id;
            dto.studentId = this.studentId;
            dto.firstName = this.firstName;
            dto.lastName = this.lastName;
            dto.email = this.email;
            dto.dateOfBirth = this.dateOfBirth;
            dto.grade = this.grade;
            dto.section = this.section;
            dto.contactNumber = this.contactNumber;
            dto.address = this.address;
            dto.gender = this.gender;
            dto.guardianName = this.guardianName;
            dto.guardianContact = this.guardianContact;
            dto.guardianEmail = this.guardianEmail;
            dto.guardianOccupation = this.guardianOccupation;
            dto.guardianOfficeAddress = this.guardianOfficeAddress;
            dto.aadharNumber = this.aadharNumber;
            dto.udiseNumber = this.udiseNumber;
            dto.houseAlloted = this.houseAlloted;
            dto.guardianAnnualIncome = this.guardianAnnualIncome;
            dto.previousSchool = this.previousSchool;
            dto.tcNumber = this.tcNumber;
            dto.tcReason = this.tcReason;
            dto.tcDate = this.tcDate;
            dto.whatsappNumber = this.whatsappNumber;
            dto.subjects = this.subjects;
            dto.transportMode = this.transportMode;
            dto.busRouteNumber = this.busRouteNumber;
            dto.status = this.status;
            dto.admissionDate = this.admissionDate;
            dto.photoUrl = this.photoUrl;
            dto.bloodGroup = this.bloodGroup;
            dto.medicalConditions = this.medicalConditions;
            return dto;
        }
    }
}