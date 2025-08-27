package com.school.fee.repository;

import com.school.fee.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Use explicit JPQL to reference the nested student.id property
    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId")
    List<Payment> findByStudentId(@Param("studentId") Long studentId);

        // Use explicit JPQL to reference the nested fee.id property to avoid
        // Spring Data deriving an invalid path like BaseEntity.feeId
        @Query("SELECT p FROM Payment p WHERE p.fee.id = :feeId")
        List<Payment> findByFeeId(@Param("feeId") Long feeId);

    List<Payment> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // For getting the latest payment for a student
    // Use association path in derived query to get the latest payment for a student
    java.util.Optional<Payment> findTopByStudent_IdOrderByPaymentDateDesc(Long studentId);

    // Custom query for filtered payments
    @Query("SELECT p FROM Payment p JOIN p.student s WHERE " +
            "(:grade IS NULL OR s.grade = :grade) AND " +
            "(:section IS NULL OR s.section = :section) AND " +
            "(:studentName IS NULL OR LOWER(CONCAT(s.firstName, ' ', s.lastName)) LIKE LOWER(CONCAT('%', :studentName, '%')))")
    List<Payment> findFilteredPayments(@Param("grade") Integer grade,
            @Param("section") String section,
            @Param("studentName") String studentName);

    // Lookup by receipt number for durable receipt retrieval
    java.util.Optional<Payment> findByReceiptNumber(String receiptNumber);
}