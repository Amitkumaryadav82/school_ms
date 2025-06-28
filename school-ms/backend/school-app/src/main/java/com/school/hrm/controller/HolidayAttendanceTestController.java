package com.school.hrm.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.school.attendance.service.EmployeeAttendanceService;
import com.school.attendance.service.HolidayAttendanceService;
import com.school.hrm.dto.HolidayDTO;
import com.school.hrm.model.Holiday;
import com.school.hrm.model.Holiday.HolidayType;
import com.school.hrm.service.HolidayService;

/**
 * Controller for testing holiday attendance functionality
 */
@RestController
@RequestMapping("/api/debug/holiday-attendance-test")
public class HolidayAttendanceTestController {

    private final HolidayService holidayService;
    private final HolidayAttendanceService holidayAttendanceService;
    private final EmployeeAttendanceService employeeAttendanceService;

    @Autowired
    public HolidayAttendanceTestController(
        HolidayService holidayService,
        HolidayAttendanceService holidayAttendanceService,
        EmployeeAttendanceService employeeAttendanceService) {
        this.holidayService = holidayService;
        this.holidayAttendanceService = holidayAttendanceService;
        this.employeeAttendanceService = employeeAttendanceService;
    }

    /**
     * Creates a test holiday for today and automatically marks attendance
     */
    @PostMapping("/create-today-holiday-and-mark-attendance")
    public ResponseEntity<Map<String, Object>> createTodayHolidayAndMarkAttendance() {
        Map<String, Object> result = new HashMap<>();
        
        // Create a holiday for today
        LocalDate today = LocalDate.now();
        HolidayDTO holidayDTO = new HolidayDTO();
        holidayDTO.setDate(today);
        holidayDTO.setName("Test Holiday " + today);
        holidayDTO.setDescription("This is a test holiday created for debugging");
        holidayDTO.setType(HolidayType.OTHER);
        
        // Save the holiday
        HolidayDTO createdHoliday = holidayService.createHoliday(holidayDTO);
        result.put("holiday", createdHoliday);
        
        // Mark attendance for all staff
        int recordsUpdated = holidayAttendanceService.ensureHolidayAttendance(today);
        result.put("recordsUpdated", recordsUpdated);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Reprocesses attendance for a specific date, ensuring all staff have HOLIDAY status
     */
    @PostMapping("/reprocess-attendance")
    public ResponseEntity<Map<String, Object>> reprocessAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        Map<String, Object> result = new HashMap<>();
        
        // Check if it's a holiday
        boolean isHoliday = holidayAttendanceService.isHoliday(date);
        result.put("isHoliday", isHoliday);
        
        if (isHoliday) {
            // Ensure holiday attendance
            int recordsUpdated = holidayAttendanceService.ensureHolidayAttendance(date);
            result.put("recordsUpdated", recordsUpdated);
            result.put("message", "Holiday attendance records updated successfully");
        } else {
            result.put("message", "The specified date is not a holiday");
        }
        
        return ResponseEntity.ok(result);
    }
}
