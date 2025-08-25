package com.school.attendance.repository;

import com.school.attendance.model.Attendance;
import com.school.attendance.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
        Optional<Attendance> findByStudent_IdAndDate(Long studentId, LocalDate date);

        List<Attendance> findByStudent_Id(Long studentId);

        List<Attendance> findByDate(LocalDate date);

        List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);

        List<Attendance> findByStudent_IdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);

        long countByStudent_IdAndStatusAndDateBetween(Long studentId, AttendanceStatus status, LocalDate startDate,
                        LocalDate endDate);

        List<Attendance> findByStudent_GradeAndDate(Integer grade, LocalDate date);

        List<Attendance> findByStudent_GradeAndStudent_SectionAndDate(Integer grade, String section, LocalDate date);

        void deleteByDateBefore(LocalDate date);

        int countByDateBefore(LocalDate date);

        long countByStudent_IdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
}