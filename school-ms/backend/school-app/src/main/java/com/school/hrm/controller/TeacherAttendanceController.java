package com.school.hrm.controller;

import com.school.attendance.dto.BulkStaffAttendanceRequest;
import com.school.attendance.dto.StaffAttendanceDTO;
import com.school.attendance.model.StaffAttendanceStatus;
import com.school.attendance.service.StaffAttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hrm/teacher-attendance")
public class TeacherAttendanceController {
    
    private final StaffAttendanceService staffAttendanceService;
    
    @Autowired
    public TeacherAttendanceController(StaffAttendanceService staffAttendanceService) {
        this.staffAttendanceService = staffAttendanceService;
    }

    /**
     * Endpoint to download a CSV template for teacher attendance uploads.
     * 
     * @return A CSV file with headers for teacher attendance data.
     */
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadAttendanceTemplate() {
        // Create a CSV template with headers
        StringBuilder csvBuilder = new StringBuilder();
        
        // Add CSV headers
        csvBuilder.append("Employee ID,Employee Name,Attendance Date,Status,Reason,Remarks\n");
        
        // Add a sample row (commented out with # to serve as example)
        csvBuilder.append("# 1001,John Doe,2025-06-27,PRESENT,,Regular attendance\n");
        csvBuilder.append("# 1002,Jane Smith,2025-06-27,ABSENT,Sick leave,Doctor's appointment\n");
        csvBuilder.append("# 1003,Robert Johnson,2025-06-27,HALF_DAY,Personal work,Left early\n");
        csvBuilder.append("# Status options: PRESENT, ABSENT, HALF_DAY, ON_LEAVE\n");
        
        // Convert to byte array
        byte[] csvBytes = csvBuilder.toString().getBytes();
        
        // Set up response headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "teacher_attendance_template.csv");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        // Return the CSV template
        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }
    
    // Staff Attendance CRUD Operations
    
    @PostMapping
    public ResponseEntity<StaffAttendanceDTO> createStaffAttendance(@Valid @RequestBody StaffAttendanceDTO staffAttendanceDTO) {
        StaffAttendanceDTO createdAttendance = staffAttendanceService.createStaffAttendance(staffAttendanceDTO);
        return new ResponseEntity<>(createdAttendance, HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<StaffAttendanceDTO>> createBulkStaffAttendance(
            @Valid @RequestBody BulkStaffAttendanceRequest bulkRequest) {
        List<StaffAttendanceDTO> createdAttendances = staffAttendanceService.createBulkStaffAttendance(bulkRequest);
        return new ResponseEntity<>(createdAttendances, HttpStatus.CREATED);
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadAttendanceFile(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = staffAttendanceService.processAttendanceFile(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<StaffAttendanceDTO>> getStaffAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<StaffAttendanceDTO> attendanceList = staffAttendanceService.getStaffAttendanceByDate(date);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/employee/{staffId}")
    public ResponseEntity<List<StaffAttendanceDTO>> getStaffAttendanceByStaffId(@PathVariable Long staffId) {
        List<StaffAttendanceDTO> attendanceList = staffAttendanceService.getStaffAttendanceByStaffId(staffId);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/employee/{staffId}/date/{date}")
    public ResponseEntity<StaffAttendanceDTO> getStaffAttendanceByStaffIdAndDate(
            @PathVariable Long staffId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        StaffAttendanceDTO attendance = staffAttendanceService.getStaffAttendanceByStaffIdAndDate(staffId, date);
        return attendance != null ? ResponseEntity.ok(attendance) : ResponseEntity.notFound().build();
    }

    @GetMapping("/range")
    public ResponseEntity<List<StaffAttendanceDTO>> getStaffAttendanceByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<StaffAttendanceDTO> attendanceList = staffAttendanceService.getStaffAttendanceByDateRange(startDate, endDate);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/employee/{staffId}/range")
    public ResponseEntity<List<StaffAttendanceDTO>> getStaffAttendanceByStaffIdAndDateRange(
            @PathVariable Long staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<StaffAttendanceDTO> attendanceList = 
                staffAttendanceService.getStaffAttendanceByStaffIdAndDateRange(staffId, startDate, endDate);
        return ResponseEntity.ok(attendanceList);
    }
    
    @GetMapping("/report/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyAttendanceReport(
            @RequestParam int year,
            @RequestParam int month) {
        Map<String, Object> report = staffAttendanceService.getMonthlyAttendanceReport(year, month);
        return ResponseEntity.ok(report);
    }
    
    @GetMapping("/current-month")
    public ResponseEntity<Map<String, Object>> getCurrentMonthAttendance() {
        LocalDate now = LocalDate.now();
        Map<String, Object> report = staffAttendanceService.getMonthlyAttendanceReport(now.getYear(), now.getMonthValue());
        return ResponseEntity.ok(report);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffAttendanceDTO> updateStaffAttendance(
            @PathVariable Long id,
            @Valid @RequestBody StaffAttendanceDTO staffAttendanceDTO) {
        StaffAttendanceDTO updatedAttendance = staffAttendanceService.updateStaffAttendance(id, staffAttendanceDTO);
        return ResponseEntity.ok(updatedAttendance);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaffAttendance(@PathVariable Long id) {
        staffAttendanceService.deleteStaffAttendance(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status-types")
    public ResponseEntity<StaffAttendanceStatus[]> getAllStaffAttendanceStatuses() {
        return ResponseEntity.ok(StaffAttendanceStatus.values());
    }
    
    @GetMapping("/stats/employee/{staffId}")
    public ResponseEntity<Map<String, Object>> getAttendanceStats(
            @PathVariable Long staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> stats = staffAttendanceService.getEmployeeAttendanceStats(staffId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getAttendanceOverview(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<StaffAttendanceStatus, Long> stats = staffAttendanceService.getOverallAttendanceStats(startDate, endDate);
        // Convert the enum keys to strings for consistent API response format
        Map<String, Object> overview = new HashMap<>();
        stats.forEach((status, count) -> overview.put(status.name(), count));
        return ResponseEntity.ok(Map.of("overview", overview));
    }
    
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkIfHoliday(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        boolean isHoliday = staffAttendanceService.isHoliday(date);
        return ResponseEntity.ok(Map.of("isHoliday", isHoliday));
    }
}
