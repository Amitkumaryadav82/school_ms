package com.school.admission.service;

import com.school.admission.model.Admission;
import com.school.admission.model.Admission.AdmissionStatus;
import com.school.admission.repository.AdmissionRepository;
import com.school.admission.dto.AdmissionRequest;
import com.school.admission.dto.AdmissionResponse;
import com.school.admission.exception.AdmissionNotFoundException;
import com.school.admission.exception.InvalidAdmissionStateException;
import com.school.student.model.Student;
import com.school.student.service.StudentService;
import com.school.security.UserRole;
import com.school.security.AuthService;
import com.school.security.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class AdmissionService {
    // ...existing autowired fields...

    public AdmissionResponse updateApplicationStatus(Long id, AdmissionStatus newStatus, String remarks) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new AdmissionNotFoundException("Admission application not found with id: " + id));

        validateStatusTransition(admission.getStatus(), newStatus);
        
        admission.setStatus(newStatus);
        if (newStatus == AdmissionStatus.REJECTED) {
            admission.setRejectionReason(remarks);
        }

        if (newStatus == AdmissionStatus.APPROVED) {
            // Create student record
            Student student = createStudentFromAdmission(admission);
            student = studentService.createStudent(student);
            admission.setStudent(student);
            
            // Create user account for student
            RegisterRequest userRequest = RegisterRequest.builder()
                    .username(student.getStudentId())
                    .email(admission.getEmail())
                    .password(generateTemporaryPassword())
                    .role(UserRole.STUDENT)
                    .build();
            authService.register(userRequest);
        }

        admission = admissionRepository.save(admission);
        return createAdmissionResponse(admission, getStatusUpdateMessage(newStatus));
    }

    // ...rest of the existing methods...
}