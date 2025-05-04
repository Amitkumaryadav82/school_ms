package com.school.fee.controller;

import com.school.fee.model.Fee;
import com.school.fee.model.Payment;
import com.school.fee.service.FeeService;
import com.school.fee.dto.FeeRequest;
import com.school.fee.dto.PaymentRequest;
import com.school.fee.dto.FeePaymentSummary;
import com.school.fee.dto.SemesterFeeReport;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fees")
@Tag(name = "Fee Management", description = "APIs for managing school fees and payments")
@SecurityRequirement(name = "bearerAuth")
public class FeeController {

    @Autowired
    private FeeService feeService;

    @Operation(summary = "Create new fee", description = "Creates a new fee record")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Fee created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid fee data"),
            @ApiResponse(responseCode = "403", description = "Not authorized to create fees")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Fee> createFee(@Valid @RequestBody FeeRequest request) {
        return ResponseEntity.ok(feeService.createFee(request));
    }

    @Operation(summary = "Update fee", description = "Updates an existing fee record")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Fee updated successfully"),
            @ApiResponse(responseCode = "404", description = "Fee not found"),
            @ApiResponse(responseCode = "400", description = "Invalid fee data")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Fee> updateFee(
            @PathVariable Long id,
            @Valid @RequestBody FeeRequest request) {
        return ResponseEntity.ok(feeService.updateFee(id, request));
    }

    @Operation(summary = "Get fees by grade", description = "Retrieves all fees for a specific grade")
    @ApiResponse(responseCode = "200", description = "Fees retrieved successfully")
    @GetMapping("/grade/{grade}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')")
    public ResponseEntity<List<Fee>> getFeesByGrade(@PathVariable Integer grade) {
        return ResponseEntity.ok(feeService.getFeesByGrade(grade));
    }

    @Operation(summary = "Get fees by due date range", description = "Retrieves fees with due dates within a specified range")
    @ApiResponse(responseCode = "200", description = "Fees retrieved successfully")
    @GetMapping("/due-date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Fee>> getFeesByDueDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(feeService.getFeesByDueDateRange(startDate, endDate));
    }

    @Operation(summary = "Process payment", description = "Records a fee payment")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Payment processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payment data"),
            @ApiResponse(responseCode = "404", description = "Fee or student not found")
    })
    @PostMapping("/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(feeService.processPayment(request));
    }

    @Operation(summary = "Get student payments", description = "Retrieves all payments made by a student")
    @ApiResponse(responseCode = "200", description = "Payments retrieved successfully")
    @GetMapping("/payments/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Payment>> getStudentPayments(@PathVariable Long studentId) {
        return ResponseEntity.ok(feeService.getStudentPayments(studentId));
    }

    @Operation(summary = "Get student fee summary", description = "Retrieves fee payment summary for a student")
    @ApiResponse(responseCode = "200", description = "Fee summary retrieved successfully")
    @GetMapping("/summary/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<FeePaymentSummary>> getStudentFeeSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(feeService.getStudentFeeSummary(studentId));
    }

    @Operation(summary = "Generate semester report", description = "Generates a detailed fee report for a semester")
    @ApiResponse(responseCode = "200", description = "Report generated successfully")
    @GetMapping("/report/semester")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SemesterFeeReport> generateSemesterReport(
            @RequestParam Integer year,
            @RequestParam String semester) {
        return ResponseEntity.ok(feeService.generateSemesterReport(year, semester));
    }
}