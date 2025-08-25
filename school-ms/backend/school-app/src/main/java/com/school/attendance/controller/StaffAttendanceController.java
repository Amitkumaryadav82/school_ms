package com.school.attendance.controller;

import com.school.attendance.dto.BulkStaffAttendanceRequest;
import com.school.attendance.dto.StaffAttendanceDTO;
import com.school.attendance.model.StaffAttendanceStatus;
import com.school.attendance.service.StaffAttendanceService;
import javax.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/staff-attendance")
public class StaffAttendanceController {

    private final StaffAttendanceService staffAttendanceService;

    public StaffAttendanceController(StaffAttendanceService staffAttendanceService) {
        this.staffAttendanceService = staffAttendanceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<StaffAttendanceDTO> createStaffAttendance(@Valid @RequestBody StaffAttendanceDTO staffAttendanceDTO) {
        StaffAttendanceDTO createdAttendance = staffAttendanceService.createStaffAttendance(staffAttendanceDTO);
        return new ResponseEntity<>(createdAttendance, HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<List<StaffAttendanceDTO>> createBulkStaffAttendance(
            @Valid @RequestBody BulkStaffAttendanceRequest bulkRequest) {
        List<StaffAttendanceDTO> createdAttendances = staffAttendanceService.createBulkStaffAttendance(bulkRequest);
        return new ResponseEntity<>(createdAttendances, HttpStatus.CREATED);
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<List<StaffAttendanceDTO>> getStaffAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<StaffAttendanceDTO> attendanceList = staffAttendanceService.getStaffAttendanceByDate(date);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF') or (hasRole('LIBRARIAN') and @authz.isMyStaffId(#staffId))")
    public ResponseEntity<List<StaffAttendanceDTO>> getStaffAttendanceByStaffId(@PathVariable Long staffId) {
        List<StaffAttendanceDTO> attendanceList = staffAttendanceService.getStaffAttendanceByStaffId(staffId);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/staff/{staffId}/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF') or (hasRole('LIBRARIAN') and @authz.isMyStaffId(#staffId))")
    public ResponseEntity<StaffAttendanceDTO> getStaffAttendanceByStaffIdAndDate(
            @PathVariable Long staffId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        StaffAttendanceDTO attendance = staffAttendanceService.getStaffAttendanceByStaffIdAndDate(staffId, date);
        return attendance != null ? ResponseEntity.ok(attendance) : ResponseEntity.notFound().build();
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<List<StaffAttendanceDTO>> getStaffAttendanceByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<StaffAttendanceDTO> attendanceList = staffAttendanceService.getStaffAttendanceByDateRange(startDate, endDate);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/staff/{staffId}/date-range")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF') or (hasRole('LIBRARIAN') and @authz.isMyStaffId(#staffId))")
    public ResponseEntity<List<StaffAttendanceDTO>> getStaffAttendanceByStaffIdAndDateRange(
            @PathVariable Long staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<StaffAttendanceDTO> attendanceList = 
                staffAttendanceService.getStaffAttendanceByStaffIdAndDateRange(staffId, startDate, endDate);
        return ResponseEntity.ok(attendanceList);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<StaffAttendanceDTO> updateStaffAttendance(
            @PathVariable Long id,
            @Valid @RequestBody StaffAttendanceDTO staffAttendanceDTO) {
        StaffAttendanceDTO updatedAttendance = staffAttendanceService.updateStaffAttendance(id, staffAttendanceDTO);
        return ResponseEntity.ok(updatedAttendance);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Void> deleteStaffAttendance(@PathVariable Long id) {
        staffAttendanceService.deleteStaffAttendance(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statuses")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','LIBRARIAN')")
    public ResponseEntity<StaffAttendanceStatus[]> getAllStaffAttendanceStatuses() {
        return ResponseEntity.ok(StaffAttendanceStatus.values());
    }
}
