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

        // Custom query for filtered payments (extended)
        @Query("SELECT p FROM Payment p JOIN p.student s WHERE " +
                        "(:grade IS NULL OR s.grade = :grade) AND " +
                        "(:section IS NULL OR s.section = :section) AND " +
                        "(:studentName IS NULL OR LOWER(CONCAT(s.firstName, ' ', s.lastName)) LIKE LOWER(CONCAT('%', :studentName, '%'))) AND "
                        +
                        "(:start IS NULL OR p.paymentDate >= :start) AND " +
                        "(:end IS NULL OR p.paymentDate <= :end) AND " +
                        "(:status IS NULL OR p.status = :status) AND " +
                        "(:method IS NULL OR p.paymentMethod = :method) AND " +
                        "(:minAmount IS NULL OR p.amount >= :minAmount) AND " +
                        "(:maxAmount IS NULL OR p.amount <= :maxAmount)")
        List<Payment> findFilteredPayments(
                        @Param("grade") Integer grade,
                        @Param("section") String section,
                        @Param("studentName") String studentName,
                        @Param("start") java.time.LocalDateTime start,
                        @Param("end") java.time.LocalDateTime end,
                        @Param("status") com.school.fee.model.Payment.PaymentStatus status,
                        @Param("method") com.school.fee.model.Payment.PaymentMethod method,
                        @Param("minAmount") Double minAmount,
                        @Param("maxAmount") Double maxAmount);

        // Lookup by receipt number for durable receipt retrieval
        java.util.Optional<Payment> findByReceiptNumber(String receiptNumber);

        // Reports: class-section-month/year payments
        @Query("SELECT p FROM Payment p JOIN p.student s WHERE s.grade = :grade AND (:section IS NULL OR s.section = :section) AND p.paymentDate BETWEEN :start AND :end")
        List<Payment> findByClassSectionAndDateRange(@Param("grade") Integer grade,
                        @Param("section") String section,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // Reports: specific student by date range
        @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId AND p.paymentDate BETWEEN :start AND :end")
        List<Payment> findByStudentAndDateRange(@Param("studentId") Long studentId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);
}