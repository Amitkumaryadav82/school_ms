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

    @Autowired
    private AdmissionRepository admissionRepository;

    @Autowired
    private StudentService studentService;

    @Autowired
    private AuthService authService;

    public AdmissionResponse submitApplication(AdmissionRequest request) {
        // Check if applicant already has a pending application
        if (admissionRepository.existsByEmailAndStatus(request.getEmail(), AdmissionStatus.PENDING)) {
            throw new InvalidAdmissionStateException("Applicant already has a pending application");
        }

        Admission admission = Admission.builder()
                .applicationDate(LocalDate.now())
                .applicantName(request.getApplicantName())
                .dateOfBirth(request.getDateOfBirth())
                .email(request.getEmail())
                .contactNumber(request.getContactNumber())
                .guardianName(request.getGuardianName())
                .guardianContact(request.getGuardianContact())
                .guardianEmail(request.getGuardianEmail())
                .gradeApplying(request.getGradeApplying())
                .previousSchool(request.getPreviousSchool())
                .previousGrade(request.getPreviousGrade())
                .previousPercentage(request.getPreviousPercentage())
                .documents(request.getDocuments())
                .documentsFormat(request.getDocumentsFormat())
                .status(AdmissionStatus.PENDING)
                .build();

        admission = admissionRepository.save(admission);
        return createAdmissionResponse(admission, "Application submitted successfully");
    }

    public AdmissionResponse updateApplicationStatus(Long id, AdmissionStatus newStatus, String remarks) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new AdmissionNotFoundException("Admission application not found with id: " + id));

        validateStatusTransition(admission.getStatus(), newStatus);

        admission.setStatus(newStatus);
        if (newStatus == AdmissionStatus.REJECTED) {
            admission.setRejectionReason(remarks);
        }

        if (newStatus == AdmissionStatus.APPROVED) {
            // Create student account
            Student student = createStudentFromAdmission(admission);
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

    public List<Admission> getAdmissionsByStatus(AdmissionStatus status) {
        return admissionRepository.findByStatus(status);
    }

    public List<Admission> searchAdmissions(String query) {
        return admissionRepository.findByApplicantNameContainingIgnoreCase(query);
    }

    public List<Admission> getAdmissionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return admissionRepository.findByApplicationDateBetween(startDate, endDate);
    }

    public List<Admission> getAdmissionsByGrade(Integer grade) {
        return admissionRepository.findByGradeApplying(grade);
    }

    public List<Admission> getAllAdmissions() {
        return admissionRepository.findAll();
    }

    private void validateStatusTransition(AdmissionStatus currentStatus, AdmissionStatus newStatus) {
        if (currentStatus == AdmissionStatus.ENROLLED || currentStatus == AdmissionStatus.CANCELLED) {
            throw new InvalidAdmissionStateException("Cannot change status of " + currentStatus + " application");
        }
        if (currentStatus == AdmissionStatus.REJECTED && newStatus != AdmissionStatus.PENDING) {
            throw new InvalidAdmissionStateException("Rejected application can only be moved back to PENDING status");
        }
    }

    private Student createStudentFromAdmission(Admission admission) {
        return Student.builder()
                .firstName(extractFirstName(admission.getApplicantName()))
                .lastName(extractLastName(admission.getApplicantName()))
                .dateOfBirth(admission.getDateOfBirth())
                .email(admission.getEmail())
                .contactNumber(admission.getContactNumber())
                .guardianName(admission.getGuardianName())
                .guardianContact(admission.getGuardianContact())
                .guardianEmail(admission.getGuardianEmail())
                .grade(admission.getGradeApplying())
                .admissionDate(LocalDate.now())
                .build();
    }

    private String generateTemporaryPassword() {
        // Generate a random 8-character password
        return "Temp" + System.currentTimeMillis() % 10000;
    }

    private String extractFirstName(String fullName) {
        return fullName.contains(" ") ? fullName.substring(0, fullName.indexOf(" ")) : fullName;
    }

    private String extractLastName(String fullName) {
        return fullName.contains(" ") ? fullName.substring(fullName.indexOf(" ") + 1) : "";
    }

    private AdmissionResponse createAdmissionResponse(Admission admission, String message) {
        return AdmissionResponse.builder()
                .id(admission.getId())
                .applicantName(admission.getApplicantName())
                .applicationDate(admission.getApplicationDate())
                .gradeApplying(admission.getGradeApplying())
                .status(admission.getStatus())
                .message(message)
                .studentId(admission.getStudent() != null ? admission.getStudent().getId() : null)
                .build();
    }

    private String getStatusUpdateMessage(AdmissionStatus status) {
        switch (status) {
            case PENDING:
                return "Application moved back to pending state";
            case UNDER_REVIEW:
                return "Application is now under review";
            case APPROVED:
                return "Application has been approved";
            case REJECTED:
                return "Application has been rejected";
            case WAITLISTED:
                return "Application has been waitlisted";
            case CANCELLED:
                return "Application has been cancelled";
            case ENROLLED:
                return "Student has been enrolled successfully";
            default:
                return "Application status updated";
        }
    }
}