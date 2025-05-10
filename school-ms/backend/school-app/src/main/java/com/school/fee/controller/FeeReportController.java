package com.school.fee.controller;

import com.school.fee.dto.ClassSectionFeeReport;
import com.school.fee.dto.SemesterFeeReport;
import com.school.fee.service.FeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees/reports")
@Tag(name = "Fee Reports", description = "APIs for generating fee payment reports")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class FeeReportController {

    @Autowired
    private FeeService feeService;

    @Operation(summary = "Generate semester report", description = "Generates a report of fee payments for a specific semester")
    @ApiResponse(responseCode = "200", description = "Report generated successfully")
    @GetMapping("/semester")
    public ResponseEntity<SemesterFeeReport> generateSemesterReport(
            @RequestParam Integer year,
            @RequestParam String semester) {
        return ResponseEntity.ok(feeService.generateSemesterReport(year, semester));
    }

    @Operation(summary = "Generate class section report", description = "Generates a report of fee payments for a specific class and section")
    @ApiResponse(responseCode = "200", description = "Report generated successfully")
    @GetMapping("/class-section")
    public ResponseEntity<ClassSectionFeeReport> generateClassSectionReport(
            @RequestParam Integer grade,
            @RequestParam String section) {
        return ResponseEntity.ok(feeService.generateClassSectionReport(grade, section));
    }

    @Operation(summary = "Generate aggregate reports", description = "Generates aggregate reports for all classes and sections")
    @ApiResponse(responseCode = "200", description = "Reports generated successfully")
    @GetMapping("/aggregate")
    public ResponseEntity<List<ClassSectionFeeReport>> generateAggregateReports() {
        return ResponseEntity.ok(feeService.generateAggregateReports());
    }
}