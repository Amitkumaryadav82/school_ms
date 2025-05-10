package com.school.fee.repository;

import com.school.fee.model.FeeStructure;
import com.school.fee.model.LateFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LateFeeRepository extends JpaRepository<LateFee, Long> {
    List<LateFee> findByFeeStructure(FeeStructure feeStructure);

    Optional<LateFee> findByFeeStructureAndMonth(FeeStructure feeStructure, Integer month);
}