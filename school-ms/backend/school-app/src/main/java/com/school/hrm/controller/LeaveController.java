package com.school.hrm.controller;

import com.school.hrm.dto.LeaveDTO;
import com.school.hrm.model.LeaveStatus;
import com.school.hrm.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "APIs for managing employee leaves")
@SecurityRequirement(name = "bearerAuth")
public class LeaveController {
    private final LeaveService leaveService;

    @Operation(summary = "Apply for leave", description = "Submit a new leave request")
    @ApiResponse(responseCode = "200", description = "Leave request submitted successfully")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STAFF')")
    public ResponseEntity<LeaveDTO> applyForLeave(@Valid @RequestBody LeaveDTO leaveDTO) {
        return ResponseEntity.ok(leaveService.applyForLeave(leaveDTO));
    }

    @Operation(summary = "Process leave request", description = "Approve or reject a leave request")
    @ApiResponse(responseCode = "200", description = "Leave request processed successfully")
    @PutMapping("/{id}/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<LeaveDTO> processLeaveRequest(
            @PathVariable Long id,
            @RequestParam LeaveStatus status,
            @RequestParam(required = false) String comments,
            @RequestParam Long approvedById) {
        return ResponseEntity.ok(leaveService.processLeaveRequest(id, status, comments, approvedById));
    }

    @Operation(summary = "Get leave request", description = "Retrieve a specific leave request")
    @ApiResponse(responseCode = "200", description = "Leave request found")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<LeaveDTO> getLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.getLeave(id));
    }

    @Operation(summary = "Get employee leaves", description = "Retrieve all leave requests for an employee")
    @ApiResponse(responseCode = "200", description = "Leave requests retrieved successfully")
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveDTO>> getEmployeeLeaves(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaves(employeeId));
    }

    @Operation(summary = "Get pending leaves", description = "Retrieve all pending leave requests")
    @ApiResponse(responseCode = "200", description = "Pending leave requests retrieved successfully")
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveDTO>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @Operation(summary = "Get leaves by date range", description = "Retrieve leave requests within a date range")
    @ApiResponse(responseCode = "200", description = "Leave requests retrieved successfully")
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<LeaveDTO>> getLeavesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(leaveService.getLeavesByDateRange(startDate, endDate));
    }
}
