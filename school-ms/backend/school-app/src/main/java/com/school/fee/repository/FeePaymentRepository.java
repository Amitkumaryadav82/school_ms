package com.school.fee.repository;

import com.school.fee.model.FeePayment;
import com.school.fee.model.FeeStructure;
import com.school.fee.model.PaymentSchedule;
import com.school.student.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    List<FeePayment> findByStudent(Student student);

    List<FeePayment> findByStudentAndPaymentDateBetween(Student student, LocalDate startDate, LocalDate endDate);

    List<FeePayment> findByFeeStructure(FeeStructure feeStructure);

    List<FeePayment> findByPaymentSchedule(PaymentSchedule paymentSchedule);
}