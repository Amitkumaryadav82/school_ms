package com.school.fee.service;

import com.school.fee.dto.FeePaymentScheduleRequest;
import com.school.fee.exception.FeePaymentScheduleException;
import com.school.fee.model.FeePaymentSchedule;
import com.school.fee.model.FeePaymentSchedule.PaymentFrequency;
import com.school.fee.repository.FeePaymentScheduleRepository;
import com.school.notification.service.NotificationService;
import com.school.student.model.Student;
import com.school.student.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;
import java.util.Optional;

@Service
public class FeePaymentScheduleService {

    private static final int MAX_FREQUENCY_CHANGES_PER_YEAR = 1;

    @Autowired
    private FeePaymentScheduleRepository scheduleRepository;

    @Autowired
    private StudentService studentService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Create or update a student's fee payment schedule
     */
    @Transactional
    public FeePaymentSchedule setPaymentSchedule(FeePaymentScheduleRequest request) {
        Student student = studentService.getStudent(request.getStudentId());
        Optional<FeePaymentSchedule> existingActiveSchedule = scheduleRepository
                .findByStudentIdAndIsActiveTrue(student.getId());

        // If changing frequency, verify against policy
        if (existingActiveSchedule.isPresent() &&
                existingActiveSchedule.get().getPaymentFrequency() != PaymentFrequency
                        .valueOf(request.getPaymentFrequency())) {
            validateFrequencyChange(student.getId(), getCurrentAcademicYear());
        }

        // Deactivate current schedule if exists
        existingActiveSchedule.ifPresent(schedule -> {
            schedule.setIsActive(false);
            schedule.setEffectiveUntil(request.getEffectiveFrom().minusDays(1));
            scheduleRepository.save(schedule);
        });

        // Calculate frequency change count
        int changeCount = existingActiveSchedule.isPresent()
                ? existingActiveSchedule.get().getFrequencyChangeCount() + 1
                : 0;

        // Create new schedule
        FeePaymentSchedule newSchedule = FeePaymentSchedule.builder()
                .student(student)
                .paymentFrequency(PaymentFrequency.valueOf(request.getPaymentFrequency()))
                .effectiveFrom(request.getEffectiveFrom())
                .academicYear(getCurrentAcademicYear())
                .isActive(true)
                .frequencyChangeCount(changeCount)
                .changeReason(request.getChangeReason())
                .build();

        FeePaymentSchedule savedSchedule = scheduleRepository.save(newSchedule);

        // Send notification about schedule change
        notifyScheduleChange(student, savedSchedule, existingActiveSchedule.orElse(null));

        return savedSchedule;
    }

    /**
     * Get current payment schedule for a student
     */
    public Optional<FeePaymentSchedule> getActiveSchedule(Long studentId) {
        return scheduleRepository.findByStudentIdAndIsActiveTrue(studentId);
    }

    /**
     * Get payment schedule history for a student
     */
    public List<FeePaymentSchedule> getPaymentScheduleHistory(Long studentId) {
        return scheduleRepository.findByStudentId(studentId);
    }

    /**
     * Get all payments with a specific frequency in current academic year
     */
    public List<FeePaymentSchedule> getSchedulesByFrequency(PaymentFrequency frequency) {
        return scheduleRepository.findByPaymentFrequencyAndAcademicYear(frequency, getCurrentAcademicYear());
    }

    /**
     * Validate if a student can change payment frequency
     */
    private void validateFrequencyChange(Long studentId, int academicYear) {
        List<FeePaymentSchedule> schedules = scheduleRepository.findByStudentIdAndAcademicYear(studentId,
                academicYear);

        // Check if any existing schedule has already reached the maximum frequency
        // change count
        for (FeePaymentSchedule schedule : schedules) {
            if (schedule.getFrequencyChangeCount() >= MAX_FREQUENCY_CHANGES_PER_YEAR) {
                throw new FeePaymentScheduleException("Payment frequency can only be changed " +
                        MAX_FREQUENCY_CHANGES_PER_YEAR + " time(s) per academic year.");
            }
        }
    }

    /**
     * Notify stakeholders about schedule changes
     */
    private void notifyScheduleChange(Student student, FeePaymentSchedule newSchedule, FeePaymentSchedule oldSchedule) {
        String subject = "Fee Payment Schedule Update";
        String message = buildScheduleChangeNotificationMessage(student, newSchedule, oldSchedule);
        notificationService.sendEmail(student.getEmail(), subject, message);

        // Also notify admin/accounting department
        // Use the same sendEmail method with admin email
        String adminEmail = "admin@school.com"; // You may want to fetch this from a configuration
        String adminSubject = "Fee Schedule Change Notification";
        String adminMessage = "Fee schedule changed for student: " + student.getId() +
                " (" + student.getFirstName() + " " + student.getLastName() + ")";
        notificationService.sendEmail(adminEmail, adminSubject, adminMessage);
    }

    private String buildScheduleChangeNotificationMessage(Student student, FeePaymentSchedule newSchedule,
            FeePaymentSchedule oldSchedule) {
        StringBuilder message = new StringBuilder();
        message.append("Dear ").append(student.getFirstName()).append(",\n\n");
        message.append("Your fee payment schedule has been updated.\n");

        if (oldSchedule != null) {
            message.append("Previous frequency: ").append(oldSchedule.getPaymentFrequency()).append("\n");
        }

        message.append("New frequency: ").append(newSchedule.getPaymentFrequency()).append("\n");
        message.append("Effective from: ").append(newSchedule.getEffectiveFrom()).append("\n");

        message.append("\nThank you,\nSchool Management");

        return message.toString();
    }

    /**
     * Calculate the current academic year (e.g., "2024-2025")
     */
    public int getCurrentAcademicYear() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();

        // Academic year typically starts in September
        if (today.getMonth().compareTo(Month.SEPTEMBER) < 0) {
            return year - 1; // Still in previous academic year
        }

        return year;
    }
}