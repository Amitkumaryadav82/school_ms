package com.school.fee.repository;

import com.school.fee.model.FeePaymentSchedule;
import com.school.fee.model.FeePaymentSchedule.PaymentFrequency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeePaymentScheduleRepository extends JpaRepository<FeePaymentSchedule, Long> {

    /**
     * Find active payment schedule for a student
     */
    Optional<FeePaymentSchedule> findByStudentIdAndIsActiveTrue(Long studentId);

    /**
     * Find all payment schedules for a student
     */
    List<FeePaymentSchedule> findByStudentId(Long studentId);

    /**
     * Find payment schedules by frequency and academic year
     */
    List<FeePaymentSchedule> findByPaymentFrequencyAndAcademicYear(PaymentFrequency frequency, int academicYear);

    /**
     * Count payment schedules for a student in an academic year
     */
    int countByStudentIdAndAcademicYear(Long studentId, int academicYear);

    /**
     * Find payment schedules for a student in a specific academic year
     */
    List<FeePaymentSchedule> findByStudentIdAndAcademicYear(Long studentId, Integer academicYear);
}