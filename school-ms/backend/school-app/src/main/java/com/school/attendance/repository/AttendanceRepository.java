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
        Optional<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);

        List<Attendance> findByStudentId(Long studentId);

        List<Attendance> findByDate(LocalDate date);

        List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);

        List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);

        long countByStudentIdAndStatusAndDateBetween(Long studentId, AttendanceStatus status, LocalDate startDate,
                        LocalDate endDate);

        List<Attendance> findByStudentGradeAndDate(Integer grade, LocalDate date);

        List<Attendance> findByStudentGradeAndStudentSectionAndDate(Integer grade, String section, LocalDate date);

        void deleteByDateBefore(LocalDate date);

        int countByDateBefore(LocalDate date);

        long countByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
}