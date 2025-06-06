package com.school.fee.controller;

import com.school.fee.dto.FeePaymentScheduleRequest;
import com.school.fee.model.FeePaymentSchedule;
import com.school.fee.service.FeePaymentScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/fees/payment-schedules")
@Tag(name = "Fee Payment Schedules", description = "APIs for managing student fee payment schedules")
@SecurityRequirement(name = "bearerAuth")
public class FeePaymentScheduleController {

    @Autowired
    private FeePaymentScheduleService scheduleService;

    @Operation(summary = "Set payment schedule", description = "Create or update a student's fee payment schedule")
    @ApiResponse(responseCode = "201", description = "Payment schedule created successfully")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<FeePaymentSchedule> setPaymentSchedule(
            @Valid @RequestBody FeePaymentScheduleRequest request) {
        return new ResponseEntity<>(scheduleService.setPaymentSchedule(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Get active payment schedule", description = "Get the current active payment schedule for a student")
    @ApiResponse(responseCode = "200", description = "Active payment schedule retrieved successfully")
    @GetMapping("/active/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FINANCE') or @securityService.isStudent(#studentId)")
    public ResponseEntity<FeePaymentSchedule> getActiveSchedule(@PathVariable Long studentId) {
        Optional<FeePaymentSchedule> schedule = scheduleService.getActiveSchedule(studentId);
        return schedule.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get payment schedule history", description = "Get the full history of payment schedules for a student")
    @ApiResponse(responseCode = "200", description = "Payment schedule history retrieved successfully")
    @GetMapping("/history/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FINANCE') or @securityService.isStudent(#studentId)")
    public ResponseEntity<List<FeePaymentSchedule>> getScheduleHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(scheduleService.getPaymentScheduleHistory(studentId));
    }

    @Operation(summary = "Get schedules by frequency", description = "Get all payment schedules with a specific frequency")
    @ApiResponse(responseCode = "200", description = "Payment schedules retrieved successfully")
    @GetMapping("/by-frequency/{frequency}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<List<FeePaymentSchedule>> getSchedulesByFrequency(
            @PathVariable FeePaymentSchedule.PaymentFrequency frequency) {
        return ResponseEntity.ok(scheduleService.getSchedulesByFrequency(frequency));
    }
}
