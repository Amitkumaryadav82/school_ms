package com.school.admission.service;

import com.school.admission.model.Admission;
import com.school.admission.model.Admission.AdmissionStatus;
import com.school.admission.repository.AdmissionRepository;
import com.school.admission.dto.AdmissionRequest;
import com.school.admission.dto.AdmissionResponse;
import com.school.admission.exception.AdmissionNotFoundException;
import com.school.admission.exception.InvalidAdmissionStateException;
import com.school.student.model.Student;
import com.school.student.model.StudentStatus;
import com.school.student.model.Gender;
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

        // DEBUG: Log incoming address
        System.out.println("DEBUG - Admission request address: " + request.getAddress());
        System.out.println("DEBUG - Full admission request: " + request);

        Admission admission = Admission.builder()
                .applicationDate(LocalDate.now())
                .applicantName(request.getApplicantName())
                .dateOfBirth(request.getDateOfBirth())
                .email(request.getEmail())
                .contactNumber(request.getContactNumber())
                .guardianName(request.getGuardianName())
                .guardianContact(request.getGuardianContact())
                .guardianEmail(request.getGuardianEmail())
                .address(request.getAddress())
                .gradeApplying(request.getGradeApplying())
                .previousSchool(request.getPreviousSchool())
                .previousGrade(request.getPreviousGrade())
                .previousPercentage(request.getPreviousPercentage())
                .documents(request.getDocuments())
                .documentsFormat(request.getDocumentsFormat())
                .status(AdmissionStatus.PENDING)
                .build();

        // DEBUG: Log entity before save
        System.out.println("DEBUG - Admission entity before save - address: " + admission.getAddress());

        admission = admissionRepository.save(admission);

        // DEBUG: Log entity after save
        System.out.println("DEBUG - Admission entity after save - address: " + admission.getAddress());
        System.out.println("DEBUG - Admission entity ID: " + admission.getId());

        return createAdmissionResponse(admission, "Application submitted successfully");
    }

    @Transactional
    public AdmissionResponse updateApplicationStatus(Long id, AdmissionStatus newStatus, String remarks) {
        System.out.println("Updating admission status for ID: " + id + " to " + newStatus);
        
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new AdmissionNotFoundException("Admission application not found with id: " + id));

        validateStatusTransition(admission.getStatus(), newStatus);
        
        // Set the new status
        admission.setStatus(newStatus);
        if (newStatus == AdmissionStatus.REJECTED) {
            admission.setRejectionReason(remarks);
        }

        // First save the admission with the updated status
        admission = admissionRepository.save(admission);
        
        // Handle student/user creation as a separate transaction if approved
        if (newStatus == AdmissionStatus.APPROVED) {
            try {
                // Create student account
                System.out.println("Creating student from admission ID: " + id);
                Student student = createStudentFromAdmission(admission);
                admission.setStudent(student);
                admission = admissionRepository.save(admission);
                
                try {
                    // Create user account for student
                    System.out.println("Creating user account for student ID: " + student.getStudentId());
                    RegisterRequest userRequest = RegisterRequest.builder()
                            .username(student.getStudentId())
                            .email(admission.getEmail())
                            .password(generateTemporaryPassword())
                            .fullName(admission.getApplicantName())
                            .role(UserRole.STUDENT)
                            .build();
                    authService.register(userRequest);
                    System.out.println("User account created successfully");
                } catch (Exception e) {
                    // If user registration fails, log the error but don't roll back the student creation
                    System.err.println("Error creating user account for student: " + e.getMessage());
                    e.printStackTrace();
                    // Return success but mention the user creation issue
                    return createAdmissionResponse(admission, 
                        "Application approved and student record created, but user account creation failed: " + e.getMessage());
                }
            } catch (Exception e) {
                // If student creation fails, log the error and throw an exception
                System.err.println("Error creating student from admission: " + e.getMessage());
                e.printStackTrace();
                throw new InvalidAdmissionStateException("Failed to create student record: " + e.getMessage());
            }
        }

        return createAdmissionResponse(admission, getStatusUpdateMessage(newStatus));
    }

    public List<Admission> getAdmissionsByStatus(AdmissionStatus status) {
        return admissionRepository.findByStatus(status);
    }

    public List<Admission> searchAdmissions(String query) {
        return admissionRepository.searchByNameOrEmail(query);
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

    public Admission getAdmissionById(Long id) {
        return admissionRepository.findById(id)
                .orElseThrow(() -> new AdmissionNotFoundException("Admission not found with id: " + id));
    }

    public AdmissionResponse updateApplication(Long id, AdmissionRequest request) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new AdmissionNotFoundException("Admission not found with id: " + id));

        // DEBUG: Log incoming data for update
        System.out.println("DEBUG - Updating admission ID: " + id);
        System.out.println("DEBUG - Update request address: " + request.getAddress());
        System.out.println("DEBUG - Full update request: " + request);
        System.out.println("DEBUG - Current address in database: " + admission.getAddress());

        // Update the admission details
        admission.setApplicantName(request.getApplicantName());
        admission.setDateOfBirth(request.getDateOfBirth());
        admission.setEmail(request.getEmail());
        admission.setContactNumber(request.getContactNumber());
        admission.setGuardianName(request.getGuardianName());
        admission.setGuardianContact(request.getGuardianContact());
        admission.setGuardianEmail(request.getGuardianEmail());
        admission.setAddress(request.getAddress());
        admission.setGradeApplying(request.getGradeApplying());
        admission.setPreviousSchool(request.getPreviousSchool());
        admission.setPreviousGrade(request.getPreviousGrade());
        admission.setPreviousPercentage(request.getPreviousPercentage());

        // DEBUG: Log entity before save
        System.out.println("DEBUG - Address after setting but before save: " + admission.getAddress());

        // Don't update status, documents or application date through this endpoint
        // those have specific endpoints

        admission = admissionRepository.save(admission);

        // DEBUG: Log entity after save
        System.out.println("DEBUG - Address after save: " + admission.getAddress());
        System.out.println("DEBUG - Full entity after save: " + admission);

        return createAdmissionResponse(admission, "Application updated successfully");
    }

    public void deleteAdmission(Long id) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new AdmissionNotFoundException("Admission not found with id: " + id));

        // Check if admission can be deleted
        if (admission.getStatus() == AdmissionStatus.ENROLLED) {
            throw new InvalidAdmissionStateException("Cannot delete an enrolled admission");
        }

        // Delete the admission
        admissionRepository.delete(admission);
    }

    public boolean hasStudentRecord(Long id) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new AdmissionNotFoundException("Admission not found with id: " + id));

        // Check if this admission has already been converted to a student
        return admission.getStudent() != null;
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
        // Generate a student ID (you can customize this format as needed)
        String studentId = "ST" + System.currentTimeMillis() % 100000;
        
        Student student = Student.builder()
                .studentId(studentId)
                .firstName(extractFirstName(admission.getApplicantName()))
                .lastName(extractLastName(admission.getApplicantName()))
                .dateOfBirth(admission.getDateOfBirth())
                .email(admission.getEmail())
                .contactNumber(admission.getContactNumber())
                .guardianName(admission.getGuardianName())
                .guardianContact(admission.getGuardianContact())
                .guardianEmail(admission.getGuardianEmail())
                .grade(admission.getGradeApplying())
                .section("A")  // Default section
                .address(admission.getAddress())
                .previousSchool(admission.getPreviousSchool())
                .admissionDate(LocalDate.now())
                .status(StudentStatus.ACTIVE)
                .gender(Gender.OTHER)  // Default gender, can be updated later
                .admission(admission)  // Set the admission relationship
                .build();
        
        try {
            // First save the admission with updated status to avoid circular reference issues
            admission = admissionRepository.save(admission);
            
            // Then save the student through StudentService to ensure all validations are applied
            return studentService.createStudent(student);
        } catch (Exception e) {
            System.err.println("Full error details for student creation: " + e.getMessage());
            e.printStackTrace();
            throw new InvalidAdmissionStateException("Failed to create student record: " + e.getMessage());
        }
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
    }    public AdmissionResponse createAdmissionResponse(Admission admission, String message) {
        return AdmissionResponse.builder()
                .id(admission.getId())
                .applicantName(admission.getApplicantName())
                .applicationDate(admission.getApplicationDate())
                .dateOfBirth(admission.getDateOfBirth().toString())
                .email(admission.getEmail())
                .contactNumber(admission.getContactNumber())
                .guardianName(admission.getGuardianName())
                .guardianContact(admission.getGuardianContact())
                .guardianEmail(admission.getGuardianEmail())
                .gradeApplying(admission.getGradeApplying())
                .status(admission.getStatus())
                .message(message)
                .address(admission.getAddress())
                // Include additional information fields
                .previousSchool(admission.getPreviousSchool())
                .previousGrade(admission.getPreviousGrade())
                .previousPercentage(admission.getPreviousPercentage())
                .documentsFormat(admission.getDocumentsFormat())
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