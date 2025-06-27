package com.school.attendance.controller;

import com.school.attendance.dto.EmployeeBulkAttendanceRequest;
import com.school.attendance.dto.EmployeeAttendanceDTO;
import com.school.attendance.model.EmployeeAttendanceStatus;
import com.school.attendance.service.EmployeeAttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Consolidated controller for managing attendance of all employees (teaching and non-teaching staff)
 */
@RestController
@RequestMapping("/api/staff/attendance")
@Tag(name = "Employee Attendance Management", description = "APIs for managing attendance of teaching and non-teaching staff")
@SecurityRequirement(name = "bearerAuth")
public class EmployeeAttendanceController {
    
    private final EmployeeAttendanceService employeeAttendanceService;
    
    @Autowired
    public EmployeeAttendanceController(EmployeeAttendanceService employeeAttendanceService) {
        this.employeeAttendanceService = employeeAttendanceService;
    }

    /**
     * Endpoint to download a CSV template for attendance uploads.
     * 
     * @return A CSV file with headers for employee attendance data.
     */
    @Operation(summary = "Download attendance template", description = "Downloads a CSV template for employee attendance uploads")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Template downloaded successfully")
    })
    @GetMapping("/template")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<byte[]> downloadAttendanceTemplate() {
        // Create a CSV template with headers
        StringBuilder csvBuilder = new StringBuilder();
        
        // Add CSV headers
        csvBuilder.append("Employee ID,Employee Name,Attendance Date,Status,Reason,Remarks\n");
        
        // Add sample rows (commented out with # to serve as example)
        csvBuilder.append("# 1001,John Doe,2025-06-27,PRESENT,,Regular attendance\n");
        csvBuilder.append("# 1002,Jane Smith,2025-06-27,ABSENT,Sick leave,Doctor's appointment\n");
        csvBuilder.append("# 1003,Robert Johnson,2025-06-27,HALF_DAY,Personal work,Left early\n");
        csvBuilder.append("# Status options: PRESENT, ABSENT, HALF_DAY, ON_LEAVE, HOLIDAY\n");
        
        // Convert to byte array
        byte[] csvBytes = csvBuilder.toString().getBytes();
        
        // Set up response headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "employee_attendance_template.csv");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        // Return the CSV template
        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }
    
    // Employee Attendance CRUD Operations
    
    @Operation(summary = "Create attendance", description = "Creates a new attendance record for an employee")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Attendance created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @PostMapping
    public ResponseEntity<EmployeeAttendanceDTO> createAttendance(@Valid @RequestBody EmployeeAttendanceDTO attendanceDTO) {
        EmployeeAttendanceDTO createdAttendance = employeeAttendanceService.createAttendance(attendanceDTO);
        return new ResponseEntity<>(createdAttendance, HttpStatus.CREATED);
    }

    @Operation(summary = "Create bulk attendance", description = "Creates attendance records for multiple employees at once")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Attendance records created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @PostMapping("/bulk")
    public ResponseEntity<List<EmployeeAttendanceDTO>> createBulkAttendance(
            @Valid @RequestBody EmployeeBulkAttendanceRequest bulkRequest) {
        List<EmployeeAttendanceDTO> createdAttendances = employeeAttendanceService.createBulkAttendance(bulkRequest);
        return new ResponseEntity<>(createdAttendances, HttpStatus.CREATED);
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadAttendanceFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "employeeType", required = false, defaultValue = "ALL") String employeeType) {
        try {
            Map<String, Object> result = employeeAttendanceService.processAttendanceFile(file, employeeType);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/employee/date/{date}")
    public ResponseEntity<List<EmployeeAttendanceDTO>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "employeeType", required = false, defaultValue = "ALL") String employeeType) {
        List<EmployeeAttendanceDTO> attendanceList = employeeAttendanceService.getAttendanceByDate(date, employeeType);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeAttendanceDTO>> getAttendanceByEmployeeId(@PathVariable Long employeeId) {
        List<EmployeeAttendanceDTO> attendanceList = employeeAttendanceService.getAttendanceByEmployeeId(employeeId);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/employee/{employeeId}/date/{date}")
    public ResponseEntity<EmployeeAttendanceDTO> getAttendanceByEmployeeIdAndDate(
            @PathVariable Long employeeId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        EmployeeAttendanceDTO attendance = employeeAttendanceService.getAttendanceByEmployeeIdAndDate(employeeId, date);
        return attendance != null ? ResponseEntity.ok(attendance) : ResponseEntity.notFound().build();
    }

    @GetMapping("/range")
    public ResponseEntity<List<EmployeeAttendanceDTO>> getAttendanceByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "employeeType", required = false, defaultValue = "ALL") String employeeType) {
        List<EmployeeAttendanceDTO> attendanceList = employeeAttendanceService.getAttendanceByDateRange(
            startDate, endDate, employeeType);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/employee/{employeeId}/range")
    public ResponseEntity<List<EmployeeAttendanceDTO>> getAttendanceByEmployeeIdAndDateRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<EmployeeAttendanceDTO> attendanceList = 
                employeeAttendanceService.getAttendanceByEmployeeIdAndDateRange(employeeId, startDate, endDate);
        return ResponseEntity.ok(attendanceList);
    }
    
    @GetMapping("/report/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyAttendanceReport(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(value = "employeeType", required = false, defaultValue = "ALL") String employeeType) {
        Map<String, Object> report = employeeAttendanceService.getMonthlyAttendanceReport(year, month, employeeType);
        return ResponseEntity.ok(report);
    }
    
    @GetMapping("/current-month")
    public ResponseEntity<Map<String, Object>> getCurrentMonthAttendance(
            @RequestParam(value = "employeeType", required = false, defaultValue = "ALL") String employeeType) {
        LocalDate now = LocalDate.now();
        Map<String, Object> report = employeeAttendanceService.getMonthlyAttendanceReport(now.getYear(), now.getMonthValue(), employeeType);
        return ResponseEntity.ok(report);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeAttendanceDTO> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeAttendanceDTO attendanceDTO) {
        EmployeeAttendanceDTO updatedAttendance = employeeAttendanceService.updateAttendance(id, attendanceDTO);
        return ResponseEntity.ok(updatedAttendance);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        employeeAttendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status-types")
    public ResponseEntity<EmployeeAttendanceStatus[]> getAllAttendanceStatuses() {
        return ResponseEntity.ok(EmployeeAttendanceStatus.values());
    }
    
    @GetMapping("/stats/employee/{employeeId}")
    public ResponseEntity<Map<String, Object>> getAttendanceStats(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> stats = employeeAttendanceService.getEmployeeAttendanceStats(employeeId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getAttendanceOverview(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "employeeType", required = false, defaultValue = "ALL") String employeeType) {
        Map<EmployeeAttendanceStatus, Long> statsMap = employeeAttendanceService.getOverallAttendanceStats(startDate, endDate, employeeType);
        
        // Convert to Map<String, Object> for the response
        Map<String, Object> overview = new HashMap<>();
        for (Map.Entry<EmployeeAttendanceStatus, Long> entry : statsMap.entrySet()) {
            overview.put(entry.getKey().name(), entry.getValue());
        }
        
        return ResponseEntity.ok(Map.of("overview", overview));
    }
    
    @GetMapping("/check-holiday")
    public ResponseEntity<Map<String, Boolean>> checkIfHoliday(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        boolean isHoliday = employeeAttendanceService.isHoliday(date);
        return ResponseEntity.ok(Map.of("isHoliday", isHoliday));
    }
    
    /* Legacy API Compatibility Endpoints */
    
    /**
     * Legacy endpoint compatibility for teacher attendance
     */
    @RestController
    @RequestMapping("/api/hrm/teacher-attendance")
    public static class TeacherAttendanceRedirectController {
        @RequestMapping(value = "/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
        public ResponseEntity<?> handleTeacherAttendanceRequests(HttpServletRequest request) {
            // Forward all requests to the proper consolidated endpoint
            return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                .header(HttpHeaders.LOCATION, request.getRequestURI().replace("/api/hrm/teacher-attendance", "/api/staff/attendance"))
                .build();
        }
    }
    
    /**
     * Legacy endpoint compatibility for staff attendance
     */
    @RestController
    @RequestMapping("/api/staff-attendance")
    public static class StaffAttendanceRedirectController {
        @RequestMapping(value = "/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
        public ResponseEntity<?> handleStaffAttendanceRequests(HttpServletRequest request) {
            // Forward all requests to the proper consolidated endpoint
            return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                .header(HttpHeaders.LOCATION, request.getRequestURI().replace("/api/staff-attendance", "/api/staff/attendance"))
                .build();
        }
    }
    
    /**
     * Legacy endpoint compatibility for old attendance API
     */
    @RestController
    @RequestMapping("/api/attendance/employee")
    public static class LegacyEmployeeAttendanceRedirectController {
        @RequestMapping(value = "/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
        public ResponseEntity<?> handleLegacyAttendanceRequests(HttpServletRequest request) {
            // Only redirect employee-specific requests
            return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                .header(HttpHeaders.LOCATION, request.getRequestURI().replace("/api/attendance", "/api/staff/attendance"))
                .build();
        }
    }
}
