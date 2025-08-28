package com.school.attendance.controller;

import com.school.attendance.model.Attendance;
import com.school.attendance.model.AttendanceStatus;
import com.school.attendance.service.AttendanceService;
import com.school.attendance.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@Tag(name = "Attendance Management", description = "APIs for managing student attendance")
@SecurityRequirement(name = "bearerAuth")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Operation(summary = "Mark bulk attendance", description = "Records attendance for multiple students at once")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Attendance marked successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "404", description = "One or more students not found")
    })
    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> markBulkAttendance(@Valid @RequestBody BulkAttendanceRequest request) {
        List<AttendanceDTO> dtos = request.getStudentIds().stream()
                .map(studentId -> AttendanceDTO.builder()
                        .studentId(studentId)
                        .date(request.getDate())
                        .status(request.getStatus())
                        .remarks(request.getRemarks())
                        .build())
                .toList();

        attendanceService.markBulkAttendance(dtos);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Mark attendance", description = "Records attendance for a student")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Attendance marked successfully"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @PostMapping("/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Void> markAttendance(
            @PathVariable Long studentId,
            @RequestParam AttendanceStatus status,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String remarks) {

        AttendanceDTO dto = AttendanceDTO.builder()
                .studentId(studentId)
                .date(date)
                .status(status)
                .remarks(remarks)
                .build();

        attendanceService.markAttendance(dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update attendance", description = "Updates an existing attendance record")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Attendance updated successfully"),
            @ApiResponse(responseCode = "404", description = "Attendance record not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Attendance> updateAttendance(
            @PathVariable Long id,
            @RequestParam AttendanceStatus status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, status, remarks));
    }

    @Operation(summary = "Mark check-out time", description = "Records check-out time for a student")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Check-out time recorded successfully"),
            @ApiResponse(responseCode = "404", description = "Attendance record not found")
    })
    @PutMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Void> markCheckOut(@PathVariable Long id) {
        attendanceService.markCheckOut(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get attendance by ID", description = "Retrieves an attendance record by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Attendance record found"),
            @ApiResponse(responseCode = "404", description = "Attendance record not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Attendance> getAttendance(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getAttendance(id));
    }

    @Operation(summary = "Get student's attendance", description = "Retrieves all attendance records for a student")
        @GetMapping("/student/{studentId}")
        @PreAuthorize("hasAnyRole('ADMIN','TEACHER') or (hasRole('STUDENT') and @authz.isMyStudentId(#studentId))")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId));
    }

    @Operation(summary = "Get attendance by date", description = "Retrieves all attendance records for a specific date")
    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }

    @Operation(summary = "Get attendance by date range", description = "Retrieves all attendance records within a date range")
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> getAttendanceByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDateRange(startDate, endDate));
    }

    @Operation(summary = "Get student's attendance by date range", description = "Retrieves attendance records for a student within a date range")
        @GetMapping("/student/{studentId}/date-range")
        @PreAuthorize("hasAnyRole('ADMIN','TEACHER') or (hasRole('STUDENT') and @authz.isMyStudentId(#studentId))")
    public ResponseEntity<List<Attendance>> getStudentAttendanceByDateRange(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceByDateRange(studentId, startDate, endDate));
    }

    @Operation(summary = "Get student's attendance count", description = "Get count of attendance records by status for a student within a date range")
        @GetMapping("/student/{studentId}/count")
        @PreAuthorize("hasAnyRole('ADMIN','TEACHER') or (hasRole('STUDENT') and @authz.isMyStudentId(#studentId))")
    public ResponseEntity<Long> getStudentAttendanceCount(
            @PathVariable Long studentId,
            @RequestParam AttendanceStatus status,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceCount(studentId, status, startDate, endDate));
    }

    @Operation(summary = "Get grade attendance", description = "Retrieves attendance records for a specific grade on a date")
    @GetMapping("/grade/{grade}/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> getGradeAttendance(
            @PathVariable Integer grade,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getGradeAttendance(grade, date));
    }

    @Operation(summary = "Get section attendance", description = "Retrieves attendance records for a specific grade and section on a date")
    @GetMapping("/grade/{grade}/section/{section}/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> getSectionAttendance(
            @PathVariable Integer grade,
            @PathVariable String section,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getSectionAttendance(grade, section, date));
    }    @Operation(summary = "Get student attendance summary", description = "Retrieves attendance summary statistics for a student within a date range")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Attendance summary retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @GetMapping("/student/{studentId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER') or (hasRole('STUDENT') and @authz.isMyStudentId(#studentId))")
    public ResponseEntity<StudentAttendanceSummaryDTO> getStudentAttendanceSummary(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceSummary(studentId, startDate, endDate));
    }

    @Operation(summary = "Mark class attendance", description = "Records attendance for all students in a specific grade and section")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Attendance marked successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request or too many students"),
            @ApiResponse(responseCode = "404", description = "Grade/section not found")
    })
    @PostMapping("/class")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> markClassAttendance(@Valid @RequestBody ClassAttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.markClassAttendance(
                request.getGrade(),
                request.getSection(),
                request.getDate(),
                request.getDefaultStatus(),
                request.getRemarks()));
    }

    @Operation(summary = "Generate monthly attendance report", description = "Generates a detailed monthly attendance report for a grade and section")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Report generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid month or year")
    })
    @GetMapping("/report/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<MonthlyAttendanceReport> getMonthlyReport(
            @RequestParam Integer grade,
            @RequestParam String section,
            @RequestParam Integer year,
            @RequestParam Integer month) {
        return ResponseEntity.ok(attendanceService.generateMonthlyReport(grade, section, year, month));
    }

    @Operation(summary = "Generate monthly attendance statistics", description = "Generates detailed monthly attendance statistics with trends and patterns")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statistics generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid month or year")
    })
    @GetMapping("/stats/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<MonthlyAttendanceStats> getMonthlyStats(
            @RequestParam Integer grade,
            @RequestParam String section,
            @RequestParam Integer year,
            @RequestParam Integer month) {
        return ResponseEntity.ok(attendanceService.generateMonthlyStats(grade, section, year, month));
    }

    @Operation(summary = "Delete attendance record", description = "Removes an attendance record from the system")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Attendance record deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Attendance record not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete all attendance for a student", description = "ADMIN-ONLY: Removes all attendance records linked to a student. Use carefully.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Attendance removed successfully"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @DeleteMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAllForStudent(@PathVariable Long studentId) {
        attendanceService.deleteAllForStudent(studentId);
        return ResponseEntity.noContent().build();
    }
}
