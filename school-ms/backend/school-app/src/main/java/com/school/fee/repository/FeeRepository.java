package com.school.fee.repository;

import com.school.fee.model.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByGrade(Integer grade);

    List<Fee> findByDueDateBetween(LocalDate startDate, LocalDate endDate);

    List<Fee> findByDueDateBefore(LocalDate date);
}