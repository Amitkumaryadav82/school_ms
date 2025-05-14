package com.school.fee.repository;

import com.school.fee.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByStudentId(Long studentId);    List<Payment> findByFeeId(Long feeId);

    List<Payment> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // For getting the latest payment for a student
    java.util.Optional<Payment> findTopByStudentIdOrderByPaymentDateDesc(Long studentId);
}