package com.school.admission.controller;

import com.school.admission.model.Admission;
import com.school.admission.model.Admission.AdmissionStatus;
import com.school.admission.service.AdmissionService;
import com.school.admission.dto.AdmissionRequest;
import com.school.admission.dto.AdmissionResponse;
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
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admissions")
@Tag(name = "Admission Management", description = "APIs for managing student admissions")
@SecurityRequirement(name = "bearerAuth")
public class AdmissionController {

    @Autowired
    private AdmissionService admissionService;

    @Operation(summary = "Submit admission application", description = "Submit a new admission application")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Application submitted successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid application data")
    })
    @PostMapping
    public ResponseEntity<AdmissionResponse> submitApplication(@Valid @RequestBody AdmissionRequest request) {
        return ResponseEntity.ok(admissionService.submitApplication(request));
    }

    @Operation(summary = "Update application status", description = "Update the status of an admission application")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Application not found"),
            @ApiResponse(responseCode = "400", description = "Invalid status transition")
    })
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdmissionResponse> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam AdmissionStatus status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(admissionService.updateApplicationStatus(id, status, remarks));
    }

    @Operation(summary = "Get applications by status", description = "Retrieve all applications with a specific status")
    @ApiResponse(responseCode = "200", description = "Applications retrieved successfully")
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdmissionResponse>> getApplicationsByStatus(@PathVariable AdmissionStatus status) {
        List<Admission> admissions = admissionService.getAdmissionsByStatus(status);
        List<AdmissionResponse> responses = admissions.stream()
            .map(admission -> admissionService.createAdmissionResponse(admission, "Retrieved successfully"))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Search applications", description = "Search applications by applicant name")
    @ApiResponse(responseCode = "200", description = "Search results retrieved successfully")
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdmissionResponse>> searchApplications(@RequestParam String query) {
        List<Admission> admissions = admissionService.searchAdmissions(query);
        List<AdmissionResponse> responses = admissions.stream()
            .map(admission -> admissionService.createAdmissionResponse(admission, "Retrieved successfully"))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Get applications by date range", description = "Retrieve applications within a date range")
    @ApiResponse(responseCode = "200", description = "Applications retrieved successfully")
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdmissionResponse>> getApplicationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Admission> admissions = admissionService.getAdmissionsByDateRange(startDate, endDate);
        List<AdmissionResponse> responses = admissions.stream()
            .map(admission -> admissionService.createAdmissionResponse(admission, "Retrieved successfully"))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Get applications by grade", description = "Retrieve applications for a specific grade")
    @ApiResponse(responseCode = "200", description = "Applications retrieved successfully")
    @GetMapping("/grade/{grade}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdmissionResponse>> getApplicationsByGrade(@PathVariable Integer grade) {
        List<Admission> admissions = admissionService.getAdmissionsByGrade(grade);
        List<AdmissionResponse> responses = admissions.stream()
            .map(admission -> admissionService.createAdmissionResponse(admission, "Retrieved successfully"))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Get all admission applications", description = "Retrieve all admission applications")
    @ApiResponse(responseCode = "200", description = "Applications retrieved successfully")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdmissionResponse>> getAllApplications() {
        List<Admission> admissions = admissionService.getAllAdmissions();
        List<AdmissionResponse> responses = admissions.stream()
            .map(admission -> admissionService.createAdmissionResponse(admission, "Retrieved successfully"))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Update admission application details", description = "Update the details of an existing admission application")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Application updated successfully"),
            @ApiResponse(responseCode = "404", description = "Application not found"),
            @ApiResponse(responseCode = "400", description = "Invalid application data")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdmissionResponse> updateApplication(
            @PathVariable Long id,
            @Valid @RequestBody AdmissionRequest request) {
        return ResponseEntity.ok(admissionService.updateApplication(id, request));
    }

    @Operation(summary = "Get application by ID", description = "Retrieve a specific application by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Application found"),
            @ApiResponse(responseCode = "404", description = "Application not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdmissionResponse> getApplicationById(@PathVariable Long id) {
        Admission admission = admissionService.getAdmissionById(id);
        return ResponseEntity.ok(admissionService.createAdmissionResponse(admission, "Application found"));
    }

    @Operation(summary = "Delete admission application", description = "Delete an admission application")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Application deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Application not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        admissionService.deleteAdmission(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Check if admission has student record", description = "Check if an admission application has been converted to a student record")
    @ApiResponse(responseCode = "200", description = "Status retrieved successfully")
    @GetMapping("/{id}/student-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> checkStudentStatus(@PathVariable Long id) {
        boolean hasStudent = admissionService.hasStudentRecord(id);
        Map<String, Object> response = new HashMap<>();
        response.put("hasStudent", hasStudent);
        return ResponseEntity.ok(response);
    }
}
