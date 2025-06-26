package com.school.hrm.repository;

import com.school.hrm.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    
    Optional<Holiday> findByDate(LocalDate date);
    
    @Query("SELECT h FROM Holiday h WHERE h.date BETWEEN :startDate AND :endDate")
    List<Holiday> findByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT h FROM Holiday h WHERE YEAR(h.date) = :year")
    List<Holiday> findByYear(@Param("year") int year);
    
    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM Holiday h WHERE h.date = :date")
    boolean existsByDate(@Param("date") LocalDate date);
}
