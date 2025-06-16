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

import com.school.staff.dto.BulkStaffRequest;
import com.school.common.dto.BulkUploadResponse;
import com.school.common.util.DateConverter;
import com.school.core.model.legacy.LegacyStaff;
import com.school.core.model.legacy.LegacyTeacherDetails;
import com.school.staff.model.Staff;
import com.school.staff.model.TeacherDetails;
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
import javax.validation.Valid;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Controller dedicated to Staff Bulk Operations
 * Note: This controller is deprecated and replaced by com.school.core.controller.StaffController
 */
@org.springframework.stereotype.Component("staffBulkController")
@Deprecated
@RequestMapping("/api/legacy-staff-bulk")
@Tag(name = "Staff Bulk Operations (Legacy)", description = "Legacy APIs for bulk management of staff records")
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
        }    }
    
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
            // Parse legacy staff from file
            List<LegacyStaff> legacyStaffList = csvXlsParser.parseLegacyStaffFromFile(file);
            
            // Convert legacy staff list to new model staff list
            List<Staff> newStaffList = new ArrayList<>();
            for (LegacyStaff legacyStaff : legacyStaffList) {
                Staff newStaff = convertToNewStaff(legacyStaff);
                newStaffList.add(newStaff);
            }
            
            BulkUploadResponse response = staffService.bulkCreateOrUpdateStaff(newStaffList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to process staff file", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new BulkUploadResponse(0, 0, List.of("Failed to process file: " + e.getMessage())));        }
    }
    
    /**
     * Converts a legacy Staff model to the new Staff model
     * 
     * @param legacyStaff The legacy model staff object
     * @return A new model staff object with copied properties
     */
    private Staff convertToNewStaff(LegacyStaff legacyStaff) {
        Staff newStaff = new Staff();
        
        newStaff.setId(legacyStaff.getId());
        newStaff.setStaffId(legacyStaff.getStaffId());
        newStaff.setFirstName(legacyStaff.getFirstName());
        newStaff.setMiddleName(legacyStaff.getMiddleName());
        newStaff.setLastName(legacyStaff.getLastName());
        newStaff.setEmail(legacyStaff.getEmail());
        newStaff.setPhone(legacyStaff.getPhone());
        newStaff.setPhoneNumber(legacyStaff.getPhoneNumber());
        newStaff.setAddress(legacyStaff.getAddress());        newStaff.setRole(legacyStaff.getRole());
        
        // Convert Date to LocalDate
        if (legacyStaff.getDateOfBirth() != null) {
            newStaff.setDateOfBirth(DateConverter.toLocalDate(legacyStaff.getDateOfBirth()));
        }
        
        if (legacyStaff.getJoiningDate() != null) {
            newStaff.setJoiningDate(DateConverter.toLocalDate(legacyStaff.getJoiningDate()));
        }
        
        newStaff.setDepartment(legacyStaff.getDepartment());
        newStaff.setActive(legacyStaff.isActive());
        
        // Handle TeacherDetails if present
        if (legacyStaff.getTeacherDetails() != null) {
            LegacyTeacherDetails legacyTeacherDetails = legacyStaff.getTeacherDetails();
            TeacherDetails newTeacherDetails = new TeacherDetails();
            
            // Copy TeacherDetails properties
            newTeacherDetails.setId(legacyTeacherDetails.getId());
            newTeacherDetails.setDepartment(legacyTeacherDetails.getDepartment());
            newTeacherDetails.setQualification(legacyTeacherDetails.getQualification());
            newTeacherDetails.setSpecialization(legacyTeacherDetails.getSpecialization());
            newTeacherDetails.setSubjects(legacyTeacherDetails.getSubjects());
            newTeacherDetails.setYearsOfExperience(legacyTeacherDetails.getYearsOfExperience());
            newTeacherDetails.setCreatedAt(DateConverter.toLocalDateTime(legacyTeacherDetails.getCreatedAt()));
            newTeacherDetails.setUpdatedAt(DateConverter.toLocalDateTime(legacyTeacherDetails.getUpdatedAt()));
            
            newStaff.setTeacherDetails(newTeacherDetails);
        }
        
        return newStaff;
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
            }            // Process the valid staff entries
            // Convert to the new Staff model
            List<Staff> newProcessedStaffList = new ArrayList<>();
            for (Staff processedStaff : processedStaffList) {
                // No conversion needed here as processedStaffList already contains new Staff objects
                newProcessedStaffList.add(processedStaff);
            }
            
            BulkUploadResponse response = staffService.bulkCreateOrUpdateStaff(newProcessedStaffList);

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
