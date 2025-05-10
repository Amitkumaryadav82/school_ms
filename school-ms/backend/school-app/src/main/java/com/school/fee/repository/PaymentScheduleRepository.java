package com.school.fee.repository;

import com.school.fee.model.FeeStructure;
import com.school.fee.model.PaymentSchedule;
import com.school.fee.model.PaymentSchedule.ScheduleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentScheduleRepository extends JpaRepository<PaymentSchedule, Long> {
    List<PaymentSchedule> findByFeeStructure(FeeStructure feeStructure);

    List<PaymentSchedule> findByFeeStructureAndIsEnabledTrue(FeeStructure feeStructure);

    Optional<PaymentSchedule> findByFeeStructureAndScheduleType(FeeStructure feeStructure, ScheduleType scheduleType);
}