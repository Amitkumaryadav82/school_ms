package com.school.fee.repository;

import com.school.fee.model.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    Optional<FeeStructure> findByClassGrade(Integer classGrade);

    boolean existsByClassGrade(Integer classGrade);
}