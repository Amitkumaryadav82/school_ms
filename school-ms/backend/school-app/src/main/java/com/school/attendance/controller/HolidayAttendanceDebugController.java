package com.school.attendance.controller;

import com.school.attendance.service.HolidayAttendanceService;
import com.school.hrm.dto.HolidayDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for debugging and testing holiday attendance functionality
 */
@RestController
@RequestMapping("/api/debug/holiday-attendance")
public class HolidayAttendanceDebugController {

    private final HolidayAttendanceService holidayAttendanceService;

    @Autowired
    public HolidayAttendanceDebugController(HolidayAttendanceService holidayAttendanceService) {
        this.holidayAttendanceService = holidayAttendanceService;
    }

    @GetMapping("/is-holiday")
    public ResponseEntity<Map<String, Object>> isHoliday(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        if (date == null) {
            date = LocalDate.now();
        }
        
        boolean isHoliday = holidayAttendanceService.isHoliday(date);
        HolidayDTO holidayDetails = holidayAttendanceService.getHolidayDetails(date);
        
        Map<String, Object> result = new HashMap<>();
        result.put("date", date);
        result.put("isHoliday", isHoliday);
        result.put("holidayDetails", holidayDetails);
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/ensure-holiday-attendance")
    public ResponseEntity<Map<String, Object>> ensureHolidayAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        if (date == null) {
            date = LocalDate.now();
        }
        
        boolean isHoliday = holidayAttendanceService.isHoliday(date);
        int recordsProcessed = 0;
        
        if (isHoliday) {
            recordsProcessed = holidayAttendanceService.ensureHolidayAttendance(date);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("date", date);
        result.put("isHoliday", isHoliday);
        result.put("recordsProcessed", recordsProcessed);
        result.put("message", isHoliday ? 
            "Holiday attendance records processed successfully" : 
            "Date is not a holiday, no attendance records created");
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/sync-all-holidays")
    public ResponseEntity<Map<String, Object>> syncAllHolidays() {
        int recordsProcessed = holidayAttendanceService.syncAllHolidaysAttendance();
        
        Map<String, Object> result = new HashMap<>();
        result.put("recordsProcessed", recordsProcessed);
        result.put("message", "Synced attendance for all holidays");
        
        return ResponseEntity.ok(result);
    }
}
