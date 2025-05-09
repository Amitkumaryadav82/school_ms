package com.school.staff.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.schoolms.dto.BulkStaffRequest;
import com.example.schoolms.dto.BulkUploadResponse;
import com.example.schoolms.model.Staff;
import com.school.staff.service.StaffServiceAdapter;
import com.school.staff.util.CsvXlsParserAdapter;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Controller dedicated to Staff Bulk Operations
 */
@RestController
@RequestMapping("/api/staff")
@Tag(name = "Staff Bulk Operations", description = "APIs for bulk management of staff records")
@SecurityRequirement(name = "bearerAuth")
public class StaffBulkController {

    private static final Logger logger = LoggerFactory.getLogger(StaffBulkController.class);

    private final StaffServiceAdapter staffService;
    private final CsvXlsParserAdapter csvXlsParser;

    @Autowired
    public StaffBulkController(StaffServiceAdapter staffService, CsvXlsParserAdapter csvXlsParser) {
        this.staffService = staffService;
        this.csvXlsParser = csvXlsParser;
    }

    /**
     * Bulk endpoint for creating or updating multiple staff records using a
     * structured JSON format
     */
    @PostMapping("/bulk")
    @Operation(operationId = "bulkCreateStaff", summary = "Create or update multiple staff members", description = "Bulk creates or updates multiple staff records in one operation")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully processed staff records", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = BulkUploadResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid data format"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<BulkUploadResponse> bulkCreateStaff(
            @Valid @RequestBody BulkStaffRequest request) {

        logger.info("Received bulk staff creation request with {} staff members", request.getStaff().size());

        // Validate expected count if provided
        if (request.getExpectedCount() != null && request.getStaff().size() != request.getExpectedCount()) {
            return ResponseEntity.badRequest().body(
                    new BulkUploadResponse(0, 0,
                            List.of("Expected count does not match the number of staff provided")));
        }

        try {
            BulkUploadResponse response = staffService.bulkCreateOrUpdateStaff(request.getStaff());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to process bulk staff creation", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new BulkUploadResponse(0, 0, List.of("Failed to process staff data: " + e.getMessage())));
        }
    }

    /**
     * Endpoint for bulk importing staff from a CSV or Excel file
     */
    @PostMapping(value = "/bulk-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(operationId = "bulkImportStaffFromFile", summary = "Import staff data from file", description = "Bulk imports staff data from a CSV or Excel file")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "File processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file format"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<BulkUploadResponse> bulkImportStaffFromFile(
            @Parameter(description = "CSV or Excel file containing staff data") @RequestParam("file") MultipartFile file) {

        logger.info("Received bulk staff file import request");

        try {
            List<Staff> staffList = csvXlsParser.parseStaffFromFile(file);
            BulkUploadResponse response = staffService.bulkCreateOrUpdateStaff(staffList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to process staff file", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new BulkUploadResponse(0, 0, List.of("Failed to process file: " + e.getMessage())));
        }
    }

    /**
     * Legacy endpoint for bulk staff import using raw JSON array
     */
    @PostMapping("/bulk-array")
    @Operation(operationId = "bulkImportStaffArray", summary = "Import staff data from array", description = "Legacy endpoint for bulk import of staff as raw JSON array")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Data processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid data format"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<BulkUploadResponse> bulkImportStaffArray(@RequestBody List<Object> staffDataList) {
        logger.info("Received bulk staff import with raw array format. Staff count: {}", staffDataList.size());

        try {
            List<Staff> processedStaffList = new ArrayList<>();
            List<String> errors = new ArrayList<>();

            // Process each staff entry in the array
            for (int i = 0; i < staffDataList.size(); i++) {
                try {
                    Object staffData = staffDataList.get(i);
                    Staff staff = new Staff();

                    // Process map data
                    if (staffData instanceof java.util.Map) {
                        @SuppressWarnings("unchecked")
                        java.util.Map<?, ?> staffMap = (java.util.Map<?, ?>) staffData;

                        // Set required fields
                        if (staffMap.get("staffId") != null)
                            staff.setStaffId(String.valueOf(staffMap.get("staffId")));
                        if (staffMap.get("firstName") != null)
                            staff.setFirstName(String.valueOf(staffMap.get("firstName")));
                        if (staffMap.get("lastName") != null)
                            staff.setLastName(String.valueOf(staffMap.get("lastName")));
                        if (staffMap.get("email") != null)
                            staff.setEmail(String.valueOf(staffMap.get("email")));
                        if (staffMap.get("role") != null)
                            staff.setRole(String.valueOf(staffMap.get("role")));

                        // Set optional fields
                        if (staffMap.get("phone") != null)
                            staff.setPhone(String.valueOf(staffMap.get("phone")));
                        if (staffMap.get("phoneNumber") != null)
                            staff.setPhoneNumber(String.valueOf(staffMap.get("phoneNumber")));
                        if (staffMap.get("address") != null)
                            staff.setAddress(String.valueOf(staffMap.get("address")));
                        if (staffMap.get("department") != null)
                            staff.setDepartment(String.valueOf(staffMap.get("department")));

                        // Process dates
                        if (staffMap.get("joinDate") != null) {
                            try {
                                staff.setJoiningDate(LocalDate.parse(String.valueOf(staffMap.get("joinDate"))));
                            } catch (Exception e) {
                                logger.warn("Failed to parse joinDate: {}", staffMap.get("joinDate"));
                            }
                        }

                        if (staffMap.get("dateOfBirth") != null) {
                            try {
                                staff.setDateOfBirth(LocalDate.parse(String.valueOf(staffMap.get("dateOfBirth"))));
                            } catch (Exception e) {
                                logger.warn("Failed to parse dateOfBirth: {}", staffMap.get("dateOfBirth"));
                            }
                        }

                        // Process boolean fields
                        if (staffMap.get("isActive") != null) {
                            if (staffMap.get("isActive") instanceof Boolean) {
                                staff.setActive((Boolean) staffMap.get("isActive"));
                            } else {
                                staff.setActive(Boolean.parseBoolean(String.valueOf(staffMap.get("isActive"))));
                            }
                        }
                    } else {
                        throw new IllegalArgumentException("Expected Map structure for staff entry");
                    }

                    // Validate required fields
                    if (staff.getFirstName() == null || staff.getLastName() == null ||
                            staff.getEmail() == null || staff.getRole() == null) {
                        errors.add("Staff entry " + (i + 1) + ": Missing required fields");
                        continue;
                    }

                    processedStaffList.add(staff);

                } catch (Exception e) {
                    logger.error("Error processing staff entry {}: {}", i + 1, e.getMessage());
                    errors.add("Staff entry " + (i + 1) + ": " + e.getMessage());
                }
            }

            // Handle empty list case
            if (processedStaffList.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new BulkUploadResponse(0, 0,
                                errors.isEmpty() ? List.of("No valid staff entries found") : errors));
            }

            // Process the valid staff entries
            BulkUploadResponse response = staffService.bulkCreateOrUpdateStaff(processedStaffList);

            // Combine service errors with parsing errors
            if (!errors.isEmpty()) {
                List<String> allErrors = new ArrayList<>(response.getErrors());
                allErrors.addAll(errors);
                response = new BulkUploadResponse(response.getCreated(), response.getUpdated(), allErrors);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to process bulk staff import", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new BulkUploadResponse(0, 0, List.of("Failed to process staff data: " + e.getMessage())));
        }
    }
}