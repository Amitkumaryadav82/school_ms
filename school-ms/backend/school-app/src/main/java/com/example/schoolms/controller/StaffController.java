package com.example.schoolms.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.schoolms.dto.BulkStaffRequest;
import com.example.schoolms.dto.BulkUploadResponse;
import com.example.schoolms.model.Staff;
import com.example.schoolms.service.StaffService;
import com.example.schoolms.util.CsvXlsParser;

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
import java.util.Optional;

@RestController("exampleSchoolmsStaffController") // Added a unique bean name here
@RequestMapping("/api/staff")
@Tag(name = "Staff Management", description = "APIs for managing staff information")
@SecurityRequirement(name = "bearerAuth")
public class StaffController {

    private static final Logger logger = LoggerFactory.getLogger(StaffController.class);

    @Autowired
    @Qualifier("exampleSchoolmsServiceStaffServiceImpl")
    private StaffService staffService;

    @Autowired
    private CsvXlsParser csvXlsParser;

    @GetMapping
    @Operation(summary = "Get all staff", description = "Retrieves all staff members in the system")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all staff")
    })
    public ResponseEntity<List<Staff>> getAllStaff() {
        List<Staff> staffList = staffService.getAllStaff();
        return ResponseEntity.ok(staffList);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get staff by ID", description = "Retrieves a specific staff member by their ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the staff member"),
            @ApiResponse(responseCode = "404", description = "Staff member not found")
    })
    public ResponseEntity<Staff> getStaffById(@PathVariable Long id) {
        Optional<Staff> staff = staffService.getStaffById(id);
        return staff.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new staff member", description = "Registers a new staff member in the system")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Staff member created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid staff data")
    })
    public ResponseEntity<Staff> createStaff(@Valid @RequestBody Staff staff) {
        Staff createdStaff = staffService.createStaff(staff);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStaff);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update staff information", description = "Updates an existing staff member's information")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Staff member updated successfully"),
            @ApiResponse(responseCode = "404", description = "Staff member not found")
    })
    public ResponseEntity<Staff> updateStaff(@PathVariable Long id, @Valid @RequestBody Staff staffDetails) {
        Optional<Staff> updatedStaff = staffService.updateStaff(id, staffDetails);
        return updatedStaff.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a staff member", description = "Removes a staff member from the system")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Staff member deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Staff member not found")
    })
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        boolean deleted = staffService.deleteStaff(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Filter staff by role
    @GetMapping("/filter/role/{role}")
    @Operation(summary = "Filter staff by role", description = "Retrieves all staff members with a specific role")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered staff list")
    })
    public ResponseEntity<List<Staff>> getStaffByRole(@PathVariable String role) {
        List<Staff> staffList = staffService.findByRole(role);
        return ResponseEntity.ok(staffList);
    }

    // Filter staff by active status
    @GetMapping("/filter/active/{active}")
    @Operation(summary = "Filter staff by active status", description = "Retrieves all active or inactive staff members")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered staff list")
    })
    public ResponseEntity<List<Staff>> getStaffByActiveStatus(@PathVariable boolean active) {
        List<Staff> staffList = staffService.findByIsActive(active);
        return ResponseEntity.ok(staffList);
    }

    // Bulk import staff from CSV/XLS file
    @PostMapping(value = "/bulk-import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import staff from CSV/XLS file", description = "Bulk imports staff members from a CSV or XLS file uploaded as multipart/form-data")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Staff data imported successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file or data format"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<BulkUploadResponse> bulkImportStaff(
            @Parameter(description = "CSV or XLS file containing staff data") @RequestParam("file") MultipartFile file) {
        try {
            List<Staff> staffList = csvXlsParser.parseStaffFromFile(file);
            BulkUploadResponse response = staffService.bulkCreateOrUpdateStaff(staffList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to process bulk staff import", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new BulkUploadResponse(0, 0, List.of("Failed to process file: " + e.getMessage())));
        }
    }

    /**
     * Structured JSON format for bulk staff creation/update
     */
    @PostMapping(value = "/bulk", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(operationId = "bulkCreateOrUpdateStaff", summary = "Create or update multiple staff members", description = "Bulk creates or updates multiple staff members from a JSON request with staff list and expected count")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Structured staff data with validation", required = true, content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = BulkStaffRequest.class)))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Staff data processed successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = BulkUploadResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid staff data or count mismatch"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<BulkUploadResponse> bulkCreateOrUpdateStaff(@Valid @RequestBody BulkStaffRequest request) {
        logger.info("Received bulk staff creation/update request with {} staff members", request.getStaff().size());

        if (request.getExpectedCount() != null && request.getStaff().size() != request.getExpectedCount()) {
            logger.warn("Expected count {} does not match actual staff count {}",
                    request.getExpectedCount(), request.getStaff().size());
            return ResponseEntity.badRequest().body(
                    new BulkUploadResponse(0, 0,
                            List.of("Expected count does not match the number of staff provided")));
        }

        try {
            BulkUploadResponse response = staffService.bulkCreateOrUpdateStaff(request.getStaff());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to process bulk staff creation/update", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new BulkUploadResponse(0, 0, List.of("Failed to process staff data: " + e.getMessage())));
        }
    }

    /**
     * Array format for bulk staff creation/update (legacy support)
     */
    @PostMapping(value = "/bulk-array", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create or update multiple staff members using array format", description = "Bulk creates or updates multiple staff members from a raw JSON array (legacy format)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Staff data processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid staff data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    public ResponseEntity<BulkUploadResponse> bulkImportStaffJson(@RequestBody List<Object> staffDataList) {
        logger.info("Received bulk staff upload request with JSON array. Staff count: " + staffDataList.size());

        try {
            List<Staff> processedStaffList = new ArrayList<>();
            List<String> errors = new ArrayList<>();

            // Process the staff list - existing code
            for (int i = 0; i < staffDataList.size(); i++) {
                try {
                    Object staffData = staffDataList.get(i);
                    Staff staff = new Staff();

                    // Parse staff data - existing code handling Map conversion
                    if (staffData instanceof java.util.Map) {
                        @SuppressWarnings("unchecked")
                        java.util.Map<?, ?> staffMap = (java.util.Map<?, ?>) staffData;

                        // Set fields with proper type conversion
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
                        if (staffMap.get("phone") != null)
                            staff.setPhone(String.valueOf(staffMap.get("phone")));
                        if (staffMap.get("phoneNumber") != null)
                            staff.setPhoneNumber(String.valueOf(staffMap.get("phoneNumber")));
                        if (staffMap.get("address") != null)
                            staff.setAddress(String.valueOf(staffMap.get("address")));
                        if (staffMap.get("department") != null)
                            staff.setDepartment(String.valueOf(staffMap.get("department")));

                        // Handle date fields
                        if (staffMap.get("joinDate") != null) {
                            try {
                                staff.setJoiningDate(LocalDate.parse(String.valueOf(staffMap.get("joinDate"))));
                            } catch (Exception e) {
                                logger.warn("Failed to parse joinDate: " + staffMap.get("joinDate"), e);
                            }
                        }

                        if (staffMap.get("dateOfBirth") != null) {
                            try {
                                staff.setDateOfBirth(LocalDate.parse(String.valueOf(staffMap.get("dateOfBirth"))));
                            } catch (Exception e) {
                                logger.warn("Failed to parse dateOfBirth: " + staffMap.get("dateOfBirth"), e);
                            }
                        }

                        // Handle boolean fields
                        if (staffMap.get("isActive") != null) {
                            if (staffMap.get("isActive") instanceof Boolean) {
                                staff.setActive((Boolean) staffMap.get("isActive"));
                            } else {
                                staff.setActive(Boolean.parseBoolean(String.valueOf(staffMap.get("isActive"))));
                            }
                        }
                    } else {
                        throw new IllegalArgumentException("Expected Map data structure for staff entry");
                    }

                    // Validate required fields
                    if (staff.getFirstName() == null || staff.getLastName() == null ||
                            staff.getEmail() == null || staff.getRole() == null) {
                        errors.add("Staff entry " + (i + 1) + ": Missing required fields");
                        continue;
                    }

                    processedStaffList.add(staff);
                } catch (Exception e) {
                    logger.error("Error processing staff entry " + (i + 1), e);
                    errors.add("Staff entry " + (i + 1) + ": " + e.getMessage());
                }
            }

            if (processedStaffList.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new BulkUploadResponse(0, 0,
                                errors.isEmpty() ? List.of("No valid staff entries found") : errors));
            }

            logger.info("Successfully processed " + processedStaffList.size() + " staff entries");
            BulkUploadResponse response = staffService.bulkCreateOrUpdateStaff(processedStaffList);

            // Add any processing errors to the response
            if (!errors.isEmpty()) {
                List<String> allErrors = new ArrayList<>(response.getErrors());
                allErrors.addAll(errors);
                response = new BulkUploadResponse(response.getCreated(), response.getUpdated(), allErrors);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to process bulk staff import from JSON", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new BulkUploadResponse(0, 0, List.of("Failed to process staff data: " + e.getMessage())));
        }
    }
}