package com.school.student.service;

import com.school.student.model.Student;
import com.school.student.model.StudentStatus;
import com.school.student.repository.StudentRepository;
import com.school.student.exception.StudentNotFoundException;
import com.school.student.exception.DuplicateStudentException;
import com.school.exception.StudentDeletionNotAllowedException;
import com.school.fee.repository.PaymentRepository;
import com.school.attendance.repository.AttendanceRepository;
import com.school.fee.repository.FeePaymentRepository;
import com.school.fee.repository.FeePaymentScheduleRepository;
import com.school.fee.repository.StudentFeeAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.school.student.dto.StudentDeletionImpactDTO;

@Service
@Transactional
public class StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentService.class);

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private FeePaymentScheduleRepository feePaymentScheduleRepository;

    @Autowired
    private StudentFeeAssignmentRepository studentFeeAssignmentRepository;

    public Student createStudent(Student student) {
        log.info("Creating new student: {} {}", student.getFirstName(), student.getLastName());
        validateNewStudent(student);

        // Set admission date if not set
        if (student.getAdmissionDate() == null) {
            student.setAdmissionDate(LocalDate.now());
        }

        // If student doesn't have a status, set it to ACTIVE
        if (student.getStatus() == null) {
            student.setStatus(StudentStatus.ACTIVE);
        }

        // Handle circular reference with admission if present
        if (student.getAdmission() != null && student.getAdmission().getStudent() == null) {
            student.getAdmission().setStudent(student);
        }

        try {
            return studentRepository.save(student);
        } catch (Exception e) {
            log.error("Error saving student: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Student updateStudent(Long id, Student student) {
        if (!studentRepository.existsById(id)) {
            throw new StudentNotFoundException("Student not found with id: " + id);
        }
        validateExistingStudent(id, student);
        student.setId(id);
        return studentRepository.save(student);
    }

    public Student getStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with id: " + id));
    }

    public Student findByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with studentId: " + studentId));
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> searchStudents(String query) {
        return studentRepository.searchStudents(query);
    }

    public List<Student> getStudentsByGrade(Integer grade) {
        return studentRepository.findByGrade(grade);
    }

    public List<Student> getStudentsBySection(String section) {
        return studentRepository.findBySection(section);
    }

    public List<Student> getStudentsByGradeAndSection(Integer grade, String section) {
        List<Student> students;
        if (section != null) {
            students = studentRepository.findByGradeAndSection(grade, section);
            log.info("Found {} students in grade {}, section {}", students.size(), grade, section);
        } else {
            students = studentRepository.findByGrade(grade);
            log.info("Found {} students in grade {} (all sections)", students.size(), grade);
        }
        // Log warning if no students found for any requested grade
        if (grade != null && students.isEmpty()) {
            log.warn(
                    "No students found for Grade {}. This might affect fee reports and other grade-specific functionality.",
                    grade);
        }
        return students;
    }

    public List<Student> getStudentsByStatus(StudentStatus status) {
        return studentRepository.findByStatus(status);
    }

    public Student updateStudentStatus(Long id, StudentStatus status) {
        Student student = getStudent(id);
        student.setStatus(status);
        return studentRepository.save(student);
    }

    public void deleteStudent(Long id) {
        // Load student once for relationship-based repositories
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with id: " + id));

        // Guard against FK violations by checking dependent records first
        int payments = 0;
        int attendance = 0;
        int feePayments = 0;
        int schedules = 0;
        int assignments = 0;
        try {
            var list = paymentRepository.findByStudentId(id);
            payments = (list != null) ? list.size() : 0;
        } catch (Exception e) {
            log.warn("Failed to check Payment dependencies for student {}: {}", id, e.getMessage());
        }
        try {
            var list = attendanceRepository.findByStudent_Id(id);
            attendance = (list != null) ? list.size() : 0;
        } catch (Exception e) {
            log.warn("Failed to check Attendance dependencies for student {}: {}", id, e.getMessage());
        }
        try {
            var list = feePaymentRepository.findByStudent(student);
            feePayments = (list != null) ? list.size() : 0;
        } catch (Exception e) {
            log.warn("Failed to check FeePayment dependencies for student {}: {}", id, e.getMessage());
        }
        try {
            var list = feePaymentScheduleRepository.findByStudentId(id);
            schedules = (list != null) ? list.size() : 0;
        } catch (Exception e) {
            log.warn("Failed to check FeePaymentSchedule dependencies for student {}: {}", id, e.getMessage());
        }
        try {
            var list = studentFeeAssignmentRepository.findByStudent(student);
            assignments = (list != null) ? list.size() : 0;
        } catch (Exception e) {
            log.warn("Failed to check StudentFeeAssignment dependencies for student {}: {}", id, e.getMessage());
        }

        // If attendance exists, purge it now (per requirement: deleting student should
        // delete attendance)
        if (attendance > 0) {
            try {
                long deleted = attendanceRepository.deleteByStudent_Id(id);
                log.info("Deleted {} attendance record(s) for student {} prior to student deletion", deleted, id);
                attendance = 0; // cleared
            } catch (Exception e) {
                log.error("Failed to delete attendance for student {}: {}", id, e.getMessage(), e);
                throw new StudentDeletionNotAllowedException(
                        "Unable to delete attendance records for the student; please retry.");
            }
        }

        // Requirement: if user confirms deletion, delete related entities too
        // Proceed to delete fee-related linked records
        try {
            if (payments > 0) {
                var list = paymentRepository.findByStudentId(id);
                if (list != null && !list.isEmpty()) {
                    log.info("Deleting {} payment(s) for student {}", list.size(), id);
                    paymentRepository.deleteAll(list);
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete Payments for student {}: {}", id, e.getMessage(), e);
            throw new StudentDeletionNotAllowedException("Unable to delete payment records linked to the student.");
        }
        try {
            if (feePayments > 0) {
                var list = feePaymentRepository.findByStudent(student);
                if (list != null && !list.isEmpty()) {
                    log.info("Deleting {} fee payment(s) for student {}", list.size(), id);
                    feePaymentRepository.deleteAll(list);
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete FeePayments for student {}: {}", id, e.getMessage(), e);
            throw new StudentDeletionNotAllowedException("Unable to delete fee payment records linked to the student.");
        }
        try {
            if (schedules > 0) {
                var list = feePaymentScheduleRepository.findByStudentId(id);
                if (list != null && !list.isEmpty()) {
                    log.info("Deleting {} payment schedule(s) for student {}", list.size(), id);
                    feePaymentScheduleRepository.deleteAll(list);
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete PaymentSchedules for student {}: {}", id, e.getMessage(), e);
            throw new StudentDeletionNotAllowedException("Unable to delete payment schedules linked to the student.");
        }
        try {
            if (assignments > 0) {
                var list = studentFeeAssignmentRepository.findByStudent(student);
                if (list != null && !list.isEmpty()) {
                    log.info("Deleting {} fee assignment(s) for student {}", list.size(), id);
                    studentFeeAssignmentRepository.deleteAll(list);
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete FeeAssignments for student {}: {}", id, e.getMessage(), e);
            throw new StudentDeletionNotAllowedException(
                    "Unable to delete fee assignment records linked to the student.");
        }

        studentRepository.deleteById(id);
    }

    /**
     * Creates multiple student records at once, with validation
     *
     * @param students List of students to create
     * @return List of created students with IDs assigned
     * @throws DuplicateStudentException if any student has duplicate ID or email
     */
    public List<Student> createStudentsBulk(List<Student> students) {
        // Pre-validate all students before saving to ensure atomicity
        for (Student student : students) {
            validateNewStudent(student);
            student.setAdmissionDate(LocalDate.now());
            // Set default status if not provided
            if (student.getStatus() == null) {
                student.setStatus(StudentStatus.ACTIVE);
            }
        }

        // Save all students
        return studentRepository.saveAll(students);
    }

    private void validateNewStudent(Student student) {
        log.debug("Validating new student with ID: {}", student.getStudentId());

        if (student.getStudentId() == null || student.getStudentId().trim().isEmpty()) {
            throw new IllegalArgumentException("Student ID cannot be null or empty");
        }

        if (studentRepository.existsByStudentId(student.getStudentId())) {
            throw new DuplicateStudentException("Student ID already exists: " + student.getStudentId());
        }

        if (student.getEmail() != null && !student.getEmail().trim().isEmpty()) {
            if (studentRepository.existsByEmail(student.getEmail())) {
                throw new DuplicateStudentException("Email already exists: " + student.getEmail());
            }
        }

        // Validate required fields
        if (student.getFirstName() == null || student.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }

        if (student.getLastName() == null || student.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }

        if (student.getContactNumber() == null || student.getContactNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Contact number is required");
        }

        if (student.getGuardianName() == null || student.getGuardianName().trim().isEmpty()) {
            throw new IllegalArgumentException("Guardian name is required");
        }

        if (student.getGuardianContact() == null || student.getGuardianContact().trim().isEmpty()) {
            throw new IllegalArgumentException("Guardian contact is required");
        }

        if (student.getSection() == null || student.getSection().trim().isEmpty()) {
            throw new IllegalArgumentException("Section is required");
        }
    }

    private void validateExistingStudent(Long id, Student student) {
        studentRepository.findByStudentId(student.getStudentId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateStudentException("Student ID already exists");
                    }
                });

        if (student.getEmail() != null) {
            studentRepository.findByEmail(student.getEmail())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new DuplicateStudentException("Email already exists");
                        }
                    });
        }
    }

    public StudentDeletionImpactDTO getDeletionImpact(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with id: " + id));

        int attendance = 0;
        int payments = 0;
        int feePayments = 0;
        int schedules = 0;
        int assignments = 0;
        try {
            attendance = attendanceRepository.findByStudent_Id(id).size();
        } catch (Exception ignored) {
        }
        try {
            payments = paymentRepository.findByStudentId(id).size();
        } catch (Exception ignored) {
        }
        try {
            feePayments = feePaymentRepository.findByStudent(student).size();
        } catch (Exception ignored) {
        }
        try {
            schedules = feePaymentScheduleRepository.findByStudentId(id).size();
        } catch (Exception ignored) {
        }
        try {
            assignments = studentFeeAssignmentRepository.findByStudent(student).size();
        } catch (Exception ignored) {
        }

        return StudentDeletionImpactDTO.builder()
                .studentId(id)
                .attendanceCount(attendance)
                .paymentsCount(payments)
                .feePaymentsCount(feePayments)
                .paymentSchedulesCount(schedules)
                .feeAssignmentsCount(assignments)
                .build();
    }
}