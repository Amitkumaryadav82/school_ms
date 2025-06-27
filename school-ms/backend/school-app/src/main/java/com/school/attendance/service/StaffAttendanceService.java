package com.school.attendance.service;

import com.school.attendance.dto.BulkStaffAttendanceRequest;
import com.school.attendance.dto.StaffAttendanceDTO;
import com.school.attendance.model.StaffAttendanceStatus;

import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface StaffAttendanceService {
    
    /**
     * Create a new staff attendance record
     */
    StaffAttendanceDTO createStaffAttendance(StaffAttendanceDTO staffAttendanceDTO);
    
    /**
     * Create multiple staff attendance records for a specific date
     */
    List<StaffAttendanceDTO> createBulkStaffAttendance(BulkStaffAttendanceRequest request);
    
    /**
     * Get all attendance records for a specific date
     */
    List<StaffAttendanceDTO> getStaffAttendanceByDate(LocalDate date);
    
    /**
     * Get all attendance records for a specific staff member
     */
    List<StaffAttendanceDTO> getStaffAttendanceByStaffId(Long staffId);
    
    /**
     * Get attendance record for a specific staff member on a specific date
     */
    StaffAttendanceDTO getStaffAttendanceByStaffIdAndDate(Long staffId, LocalDate date);
    
    /**
     * Get attendance records within a date range
     */
    List<StaffAttendanceDTO> getStaffAttendanceByDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Get attendance records for a specific staff member within a date range
     */
    List<StaffAttendanceDTO> getStaffAttendanceByStaffIdAndDateRange(Long staffId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Update an existing staff attendance record
     */
    StaffAttendanceDTO updateStaffAttendance(Long id, StaffAttendanceDTO staffAttendanceDTO);
    
    /**
     * Delete a staff attendance record
     */
    void deleteStaffAttendance(Long id);
    
    /**
     * Get attendance statistics for a date range
     */
    Map<StaffAttendanceStatus, Long> getOverallAttendanceStats(LocalDate startDate, LocalDate endDate);
    
    /**
     * Process an uploaded attendance file
     */
    Map<String, Object> processAttendanceFile(MultipartFile file) throws Exception;
    
    /**
     * Get monthly attendance report
     */
    Map<String, Object> getMonthlyAttendanceReport(int year, int month);
    
    /**
     * Get attendance statistics for an employee
     */
    Map<String, Object> getEmployeeAttendanceStats(Long staffId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Check if a date is a holiday
     */
    boolean isHoliday(LocalDate date);
}
