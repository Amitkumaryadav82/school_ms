package com.school.attendance.repository;

import com.school.attendance.model.StaffAttendance;
import com.school.attendance.model.StaffAttendanceStatus;
import com.school.core.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StaffAttendanceRepository extends JpaRepository<StaffAttendance, Long> {
    
    // Updated to use JOIN FETCH to eagerly load Staff entity and StaffRole
    @Query("SELECT sa FROM StaffAttendance sa JOIN FETCH sa.staff s LEFT JOIN FETCH s.staffRole WHERE sa.attendanceDate = :date")
    List<StaffAttendance> findByAttendanceDate(@Param("date") LocalDate date);
    
    // Updated to use JOIN FETCH to eagerly load Staff entity and StaffRole
    @Query("SELECT sa FROM StaffAttendance sa JOIN FETCH sa.staff s LEFT JOIN FETCH s.staffRole WHERE sa.staff.id = :staffId")
    List<StaffAttendance> findByStaffId(@Param("staffId") Long staffId);
    
    // Updated to use JOIN FETCH to eagerly load Staff entity and StaffRole
    @Query("SELECT sa FROM StaffAttendance sa JOIN FETCH sa.staff s LEFT JOIN FETCH s.staffRole WHERE sa.staff.id = :staffId AND sa.attendanceDate BETWEEN :startDate AND :endDate")
    List<StaffAttendance> findByStaffIdAndAttendanceDateBetween(@Param("staffId") Long staffId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Updated to use JOIN FETCH to eagerly load Staff entity and StaffRole
    @Query("SELECT sa FROM StaffAttendance sa JOIN FETCH sa.staff s LEFT JOIN FETCH s.staffRole WHERE sa.staff.id = :staffId AND sa.attendanceDate = :date")
    StaffAttendance findByStaffIdAndAttendanceDate(@Param("staffId") Long staffId, @Param("date") LocalDate date);
    
    // Updated to use JOIN FETCH to eagerly load Staff entity
    // Updated to use JOIN FETCH to eagerly load Staff entity and StaffRole
    @Query("SELECT sa FROM StaffAttendance sa JOIN FETCH sa.staff s LEFT JOIN FETCH s.staffRole WHERE sa.attendanceDate BETWEEN :startDate AND :endDate")
    List<StaffAttendance> findByAttendanceDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(sa) FROM StaffAttendance sa WHERE sa.staff.id = :staffId AND sa.status = :status AND sa.attendanceDate BETWEEN :startDate AND :endDate")
    Long countByStaffIdAndStatusAndAttendanceDateBetween(@Param("staffId") Long staffId, @Param("status") StaffAttendanceStatus status, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Custom findById method with eager loading of Staff entity and StaffRole
    @Query("SELECT sa FROM StaffAttendance sa JOIN FETCH sa.staff s LEFT JOIN FETCH s.staffRole WHERE sa.id = :id")
    Optional<StaffAttendance> findByIdWithStaff(@Param("id") Long id);
}
