package com.school.hrm.repository;

import com.school.hrm.model.SchoolHoliday;
import com.school.hrm.model.HolidayType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolHolidayRepository extends JpaRepository<SchoolHoliday, Long> {
    Optional<SchoolHoliday> findByDate(LocalDate date);

    List<SchoolHoliday> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<SchoolHoliday> findByType(HolidayType type);

    boolean existsByDate(LocalDate date);
}
