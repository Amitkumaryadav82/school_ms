package com.school.student.util;

import com.school.student.dto.StudentDTO;
import com.school.student.model.Student;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class StudentMapper {

    public StudentDTO toDTO(Student student) {
        if (student == null) {
            return null;
        }

        return StudentDTO.builder()
                .id(student.getId())
                .studentId(student.getStudentId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .dateOfBirth(student.getDateOfBirth())
                .grade(student.getGrade())
                .section(student.getSection())
                .contactNumber(student.getContactNumber())
                .address(student.getAddress())
                .gender(student.getGender())
                .guardianName(student.getGuardianName())
                .guardianContact(student.getGuardianContact())
                .guardianEmail(student.getGuardianEmail())
                .guardianOccupation(student.getGuardianOccupation())
                .guardianOfficeAddress(student.getGuardianOfficeAddress())
                .aadharNumber(student.getAadharNumber())
                .udiseNumber(student.getUdiseNumber())
                .houseAlloted(student.getHouseAlloted())
                .guardianAnnualIncome(student.getGuardianAnnualIncome())
                .previousSchool(student.getPreviousSchool())
                .tcNumber(student.getTcNumber())
                .tcReason(student.getTcReason())
                .tcDate(student.getTcDate())
                .whatsappNumber(student.getWhatsappNumber())
                .subjects(student.getSubjects())
                .transportMode(student.getTransportMode())
                .busRouteNumber(student.getBusRouteNumber())
                .status(student.getStatus())
                .admissionDate(student.getAdmissionDate())
                .photoUrl(student.getPhotoUrl())
                .bloodGroup(student.getBloodGroup())
                .medicalConditions(student.getMedicalConditions())
                .build();
    }

    public Student toEntity(StudentDTO dto) {
        if (dto == null) {
            return null;
        }

        return Student.builder()
                .id(dto.getId())
                .studentId(dto.getStudentId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .dateOfBirth(dto.getDateOfBirth())
                .grade(dto.getGrade())
                .section(dto.getSection())
                .contactNumber(dto.getContactNumber())
                .address(dto.getAddress())
                .gender(dto.getGender())
                .guardianName(dto.getGuardianName())
                .guardianContact(dto.getGuardianContact())
                .guardianEmail(dto.getGuardianEmail())
                .guardianOccupation(dto.getGuardianOccupation())
                .guardianOfficeAddress(dto.getGuardianOfficeAddress())
                .aadharNumber(dto.getAadharNumber())
                .udiseNumber(dto.getUdiseNumber())
                .houseAlloted(dto.getHouseAlloted())
                .guardianAnnualIncome(dto.getGuardianAnnualIncome())
                .previousSchool(dto.getPreviousSchool())
                .tcNumber(dto.getTcNumber())
                .tcReason(dto.getTcReason())
                .tcDate(dto.getTcDate())
                .whatsappNumber(dto.getWhatsappNumber())
                .subjects(dto.getSubjects())
                .transportMode(dto.getTransportMode())
                .busRouteNumber(dto.getBusRouteNumber())
                .status(dto.getStatus())
                .admissionDate(dto.getAdmissionDate())
                .photoUrl(dto.getPhotoUrl())
                .bloodGroup(dto.getBloodGroup())
                .medicalConditions(dto.getMedicalConditions())
                .build();
    }

    public List<StudentDTO> toDTOList(List<Student> students) {
        return students.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<Student> toEntityList(List<StudentDTO> dtos) {
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}