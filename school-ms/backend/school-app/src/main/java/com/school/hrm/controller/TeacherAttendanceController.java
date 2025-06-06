package com.school.hrm.controller;

import com.school.hrm.dto.TeacherAttendanceDTO;
import com.school.hrm.dto.BulkAttendanceRequestDTO;
import com.school.hrm.model.AttendanceStatus;
import com.school.hrm.service.TeacherAttendanceService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hrm/teacher-attendance")
public class TeacherAttendanceController {

    private final TeacherAttendanceService attendanceService;

    @Autowired
    public TeacherAttendanceController(TeacherAttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<TeacherAttendanceDTO> markAttendance(@Valid @RequestBody TeacherAttendanceDTO attendanceDTO) {
        TeacherAttendanceDTO markedAttendance = attendanceService.markAttendance(attendanceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(markedAttendance);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<TeacherAttendanceDTO> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody TeacherAttendanceDTO attendanceDTO) {
        TeacherAttendanceDTO updatedAttendance = attendanceService.updateAttendance(id, attendanceDTO);
        return ResponseEntity.ok(updatedAttendance);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherAttendanceDTO> getAttendanceById(@PathVariable Long id) {
        TeacherAttendanceDTO attendance = attendanceService.getAttendanceById(id);
        return ResponseEntity.ok(attendance);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<List<TeacherAttendanceDTO>> markBulkAttendance(
            @Valid @RequestBody BulkAttendanceRequestDTO bulkRequest) {
        List<TeacherAttendanceDTO> markedAttendances = attendanceService.markBulkAttendance(bulkRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(markedAttendances);
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<Map<String, Object>> uploadAttendanceFile(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = attendanceService.processAttendanceFile(file);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<TeacherAttendanceDTO>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<TeacherAttendanceDTO> attendances = attendanceService.getAttendanceByDate(date);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/range")
    public ResponseEntity<List<TeacherAttendanceDTO>> getAttendanceByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TeacherAttendanceDTO> attendances = attendanceService.getAttendanceByDateRange(startDate, endDate);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<TeacherAttendanceDTO>> getAttendanceByEmployee(@PathVariable Long employeeId) {
        List<TeacherAttendanceDTO> attendances = attendanceService.getAttendanceByEmployee(employeeId);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/employee/{employeeId}/range")
    public ResponseEntity<List<TeacherAttendanceDTO>> getAttendanceByEmployeeAndDateRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TeacherAttendanceDTO> attendances = attendanceService.getAttendanceByEmployeeAndDateRange(employeeId,
                startDate, endDate);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/template")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<byte[]> downloadAttendanceTemplate() {
        byte[] templateBytes = attendanceService.generateAttendanceTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "attendance_template.xlsx");

        return new ResponseEntity<>(templateBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/stats/employee/{employeeId}")
    public ResponseEntity<Map<String, Object>> getAttendanceStatsByEmployee(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> stats = attendanceService.getAttendanceStatsByEmployee(employeeId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<Map<String, Object>> getAttendanceOverview(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> overview = attendanceService.getAttendanceOverview(startDate, endDate);
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/report/monthly")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<Map<String, Object>> getMonthlyAttendanceReport(
            @RequestParam int year,
            @RequestParam int month) {
        Map<String, Object> report = attendanceService.getMonthlyAttendanceReport(year, month);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/status-types")
    public ResponseEntity<AttendanceStatus[]> getAttendanceStatusTypes() {
        return ResponseEntity.ok(AttendanceStatus.values());
    }

    @GetMapping("/current-month")
    public ResponseEntity<Map<String, Object>> getCurrentMonthAttendance() {
        YearMonth currentMonth = YearMonth.now();
        int year = currentMonth.getYear();
        int month = currentMonth.getMonthValue();

        Map<String, Object> report = attendanceService.getMonthlyAttendanceReport(year, month);
        return ResponseEntity.ok(report);
    }
}

