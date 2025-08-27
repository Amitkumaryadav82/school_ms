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
import javax.validation.Valid;
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
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PARENT') or (hasRole('STUDENT') and @authz.isMyStudentId(#studentId))")
    public ResponseEntity<List<Payment>> getStudentPayments(@PathVariable Long studentId) {
        return ResponseEntity.ok(feeService.getStudentPayments(studentId));
    }

    @Operation(summary = "Get payment by id", description = "Retrieves a payment by its identifier")
    @ApiResponse(responseCode = "200", description = "Payment retrieved successfully")
    @GetMapping("/payments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PARENT')")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return feeService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Void a payment", description = "Marks a payment as VOID with a reason")
    @ApiResponse(responseCode = "200", description = "Payment voided successfully")
    @PutMapping("/payments/{id}/void")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> voidPayment(@PathVariable Long id, @RequestBody(required = false) java.util.Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "") : "";
        boolean ok = feeService.voidPayment(id, reason);
        return ok ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Get payment by receipt number", description = "Retrieves a payment by its receipt number")
    @ApiResponse(responseCode = "200", description = "Payment retrieved successfully")
    @GetMapping("/payments/receipt/{receiptNumber}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PARENT')")
    public ResponseEntity<Payment> getPaymentByReceipt(@PathVariable String receiptNumber) {
        return feeService.getPaymentByReceiptNumber(receiptNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Download receipt", description = "Downloads a receipt PDF for a payment")
    @ApiResponse(responseCode = "200", description = "Receipt downloaded successfully")
    @GetMapping("/payments/{id}/receipt")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PARENT')")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long id) {
        return feeService.generateReceiptPdf(id)
                .map(bytes -> ResponseEntity.ok()
                        .header("Content-Type", "application/pdf")
                        .header("Content-Disposition", "attachment; filename=receipt-" + id + ".pdf")
                        .body(bytes))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get student fee summary", description = "Retrieves fee payment summary for a student")
    @ApiResponse(responseCode = "200", description = "Fee summary retrieved successfully")
    @GetMapping("/summary/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PARENT') or (hasRole('STUDENT') and @authz.isMyStudentId(#studentId))")
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

    @Operation(summary = "Generate fees due report", description = "Generates a report of students with fees due")
    @ApiResponse(responseCode = "200", description = "Report generated successfully")
    @GetMapping("/reports/fees-due")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<FeePaymentSummary>> getFeesDueReport(
            @RequestParam(required = false) Integer classGrade) {
        return ResponseEntity.ok(feeService.getFeesDueReport(classGrade));
    }

    @Operation(summary = "Generate fee status report", description = "Generates a report of fee payment status")
    @ApiResponse(responseCode = "200", description = "Report generated successfully")
    @GetMapping("/reports/fee-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<FeePaymentSummary>> getFeeStatusReport(
            @RequestParam(required = false) Integer classGrade) {
        // Log the current authentication for debugging
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null) {
            System.out.println("Current authentication: " + auth);
            System.out.println("Authorities: " + auth.getAuthorities());
        } else {
            System.out.println("No authentication found in context");
        }

        return ResponseEntity.ok(feeService.getFeeStatusReport(classGrade));
    }

    @Operation(summary = "Download fee report", description = "Downloads a fee report in Excel format")
    @ApiResponse(responseCode = "200", description = "Report downloaded successfully")
    @GetMapping("/reports/download/{reportType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<byte[]> downloadFeeReport(
            @PathVariable String reportType,
            @RequestParam(required = false) Integer classGrade) {
        byte[] reportData = feeService.generateReportExcel(reportType, classGrade);
        return ResponseEntity
                .ok()
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header("Content-Disposition", "attachment; filename=fee-report-" + reportType + ".xlsx")
                .body(reportData);
    }

    // New CSV reports
    @Operation(summary = "Download class/section payments CSV", description = "CSV for class & section by month/year or full year")
    @GetMapping("/reports/class-section/csv")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','ACCOUNTS')")
    public ResponseEntity<byte[]> downloadClassSectionCsv(
        @RequestParam Integer grade,
        @RequestParam(required = false) String section,
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year) {
    byte[] csv = feeService.generateClassSectionReportCsv(grade, section, month, year);
    String file = "class-section-payments-" + grade + (section != null ? ("-" + section) : "") +
        (year != null ? ("-" + year) : "") + (month != null ? ("-" + month) : "") + ".csv";
    return ResponseEntity.ok()
        .header("Content-Type", "text/csv")
        .header("Content-Disposition", "attachment; filename=" + file)
        .body(csv);
    }

    @Operation(summary = "Download student payments CSV", description = "CSV for a specific student by month/year or full year")
    @GetMapping("/reports/student/csv")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','PARENT','ACCOUNTS')")
    public ResponseEntity<byte[]> downloadStudentCsv(
        @RequestParam Long studentId,
        @RequestParam(required = false) Integer month,
        @RequestParam(required = false) Integer year) {
    byte[] csv = feeService.generateStudentReportCsv(studentId, month, year);
    String file = "student-payments-" + studentId +
        (year != null ? ("-" + year) : "") + (month != null ? ("-" + month) : "") + ".csv";
    return ResponseEntity.ok()
        .header("Content-Type", "text/csv")
        .header("Content-Disposition", "attachment; filename=" + file)
        .body(csv);
    }

    @Operation(summary = "Get filtered payments", description = "Retrieves payments filtered by grade, section, and/or student name")
    @ApiResponse(responseCode = "200", description = "Payments retrieved successfully")
    @GetMapping("/payments/filtered")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ResponseEntity<List<Payment>> getFilteredPayments(
            @RequestParam(required = false) Integer grade,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String studentName) {
        return ResponseEntity.ok(feeService.getFilteredPayments(grade, section, studentName));
    }
}
