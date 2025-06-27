package com.school.attendance.service;

import com.school.attendance.dto.EmployeeBulkAttendanceRequest;
import com.school.attendance.dto.EmployeeAttendanceDTO;
import com.school.attendance.model.EmployeeAttendanceStatus;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Service interface for managing employee attendance (both teaching and non-teaching staff)
 */
public interface EmployeeAttendanceService {
    
    /**
     * Create a new employee attendance record
     */
    EmployeeAttendanceDTO createAttendance(EmployeeAttendanceDTO attendanceDTO);
    
    /**
     * Create multiple employee attendance records for a specific date
     */
    List<EmployeeAttendanceDTO> createBulkAttendance(EmployeeBulkAttendanceRequest request);
    
    /**
     * Process an uploaded attendance file
     */
    Map<String, Object> processAttendanceFile(MultipartFile file, String employeeType) throws Exception;
    
    /**
     * Get all attendance records for a specific date, optionally filtered by employee type
     */
    List<EmployeeAttendanceDTO> getAttendanceByDate(LocalDate date, String employeeType);
    
    /**
     * Get all attendance records for a specific employee
     */
    List<EmployeeAttendanceDTO> getAttendanceByEmployeeId(Long employeeId);
    
    /**
     * Get attendance record for a specific employee on a specific date
     */
    EmployeeAttendanceDTO getAttendanceByEmployeeIdAndDate(Long employeeId, LocalDate date);
    
    /**
     * Get attendance records within a date range, optionally filtered by employee type
     */
    List<EmployeeAttendanceDTO> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate, String employeeType);
    
    /**
     * Get attendance records for a specific employee within a date range
     */
    List<EmployeeAttendanceDTO> getAttendanceByEmployeeIdAndDateRange(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Update an existing employee attendance record
     */
    EmployeeAttendanceDTO updateAttendance(Long id, EmployeeAttendanceDTO attendanceDTO);
    
    /**
     * Delete an employee attendance record
     */
    void deleteAttendance(Long id);
    
    /**
     * Get monthly attendance report
     */
    Map<String, Object> getMonthlyAttendanceReport(int year, int month, String employeeType);
    
    /**
     * Get attendance statistics for an employee
     */
    Map<String, Object> getEmployeeAttendanceStats(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Get overall attendance statistics
     */
    Map<EmployeeAttendanceStatus, Long> getOverallAttendanceStats(LocalDate startDate, LocalDate endDate, String employeeType);
    
    /**
     * Check if a date is a holiday
     */
    boolean isHoliday(LocalDate date);
}
