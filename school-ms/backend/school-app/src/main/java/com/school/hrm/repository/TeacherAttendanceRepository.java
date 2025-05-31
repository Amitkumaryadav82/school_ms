package com.school.hrm.repository;

import com.school.hrm.model.TeacherAttendance;
import com.school.hrm.model.AttendanceStatus;
import com.school.hrm.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherAttendanceRepository extends JpaRepository<TeacherAttendance, Long> {
    List<TeacherAttendance> findByAttendanceDate(LocalDate date);

    List<TeacherAttendance> findByAttendanceDateBetween(LocalDate startDate, LocalDate endDate);

    List<TeacherAttendance> findByEmployee(Employee employee);

    List<TeacherAttendance> findByEmployeeAndAttendanceDateBetween(
            Employee employee, LocalDate startDate, LocalDate endDate);

    Optional<TeacherAttendance> findByEmployeeAndAttendanceDate(Employee employee, LocalDate date);

    @Query("SELECT COUNT(ta) FROM TeacherAttendance ta WHERE ta.employee = :employee AND " +
            "ta.attendanceStatus = :status AND ta.attendanceDate BETWEEN :startDate AND :endDate")
    long countByEmployeeAndStatusAndDateBetween(
            @Param("employee") Employee employee,
            @Param("status") AttendanceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT ta.attendanceDate FROM TeacherAttendance ta " +
            "WHERE ta.employee = :employee AND ta.attendanceStatus = :status " +
            "AND ta.attendanceDate BETWEEN :startDate AND :endDate")
    List<LocalDate> findAttendanceDatesByEmployeeAndStatusAndDateBetween(
            @Param("employee") Employee employee,
            @Param("status") AttendanceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    void deleteByAttendanceDate(LocalDate date);
}
