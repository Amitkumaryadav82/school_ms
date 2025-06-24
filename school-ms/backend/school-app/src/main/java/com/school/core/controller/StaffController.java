package com.school.core.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.school.staff.dto.BulkStaffRequest;
import com.school.common.dto.BulkUploadResponse;
import com.school.core.dto.StaffDTO;
import com.school.core.model.Staff;
import com.school.core.service.StaffService;
import com.school.common.util.CsvXlsParser;
import com.school.core.adapter.EntityAdapter;

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
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Consolidated Staff Controller that handles all staff-related operations.
 * This controller replaces:
 * - com.example.schoolms.controller.StaffController
 * - com.school.hrm.controller.StaffController
 * - com.school.staff.controller.StaffController (if it exists)
 */
@RestController
@RequestMapping("/api/staff")
@Tag(name = "Staff Management", description = "APIs for managing staff information")
@SecurityRequirement(name = "bearerAuth")
public class StaffController {

    private static final Logger logger = LoggerFactory.getLogger(StaffController.class);
    
    @Autowired
    private StaffService staffService;    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("schoolCommonCsvXlsParser")
    private CsvXlsParser csvXlsParser;
    
    @Autowired
    private EntityAdapter entityAdapter;

    @GetMapping
    @Operation(summary = "Get all staff", description = "Retrieves all staff members in the system")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all staff")
    })
    public ResponseEntity<List<StaffDTO>> getAllStaff() {
        logger.info("Retrieving all staff members");
        List<Staff> staffList = staffService.getAllStaff();
        List<StaffDTO> dtoList = staffList.stream()
            .map(StaffDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }    @GetMapping("/{id}")
    @Operation(summary = "Get staff by ID", description = "Retrieves a staff member by their ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the staff member"),
            @ApiResponse(responseCode = "404", description = "Staff member not found")
    })
    public ResponseEntity<StaffDTO> getStaffById(@PathVariable Long id) {
        logger.info("Retrieving staff member with ID: {}", id);
        Optional<Staff> staff = staffService.getStaffById(id);
        
        if (staff.isPresent()) {
            Staff staffEntity = staff.get();
            StaffDTO dto = StaffDTO.fromEntity(staffEntity);
            
            // Add debug logging to verify all fields are being set in the DTO
            logger.debug("Staff entity values - qualifications: {}, emergencyContact: {}, pfUAN: {}, basicSalary: {}", 
                staffEntity.getQualifications(), 
                staffEntity.getEmergencyContact(),
                staffEntity.getPfUAN(),
                staffEntity.getBasicSalary());
                
            logger.debug("StaffDTO values - qualifications: {}, emergencyContact: {}, pfUAN: {}, basicSalary: {}", 
                dto.getQualifications(), 
                dto.getEmergencyContact(),
                dto.getPfUAN(),
                dto.getBasicSalary());
                
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/by-staff-id/{staffId}")
    @Operation(summary = "Get staff by staff ID", description = "Retrieves a staff member by their staff ID (not the database ID)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the staff member"),
            @ApiResponse(responseCode = "404", description = "Staff member not found")
    })
    public ResponseEntity<StaffDTO> getStaffByStaffId(@PathVariable String staffId) {
        logger.info("Retrieving staff member with staff ID: {}", staffId);
        Optional<Staff> staff = staffService.getStaffByStaffId(staffId);
        return staff.map(s -> ResponseEntity.ok(StaffDTO.fromEntity(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-email/{email}")
    @Operation(summary = "Get staff by email", description = "Retrieves a staff member by their email address")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the staff member"),
            @ApiResponse(responseCode = "404", description = "Staff member not found")
    })    public ResponseEntity<StaffDTO> getStaffByEmail(@PathVariable String email) {
        logger.info("Retrieving staff member with email: {}", email);
        Optional<Staff> staff = staffService.getStaffByEmail(email);
        return staff.map(s -> ResponseEntity.ok(StaffDTO.fromEntity(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create staff", description = "Creates a new staff member")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Successfully created the staff member"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })    public ResponseEntity<StaffDTO> createStaff(@Valid @RequestBody Staff staff) {
        logger.info("Creating new staff member: {}", staff);
        Staff createdStaff = staffService.save(staff);
        return ResponseEntity.status(HttpStatus.CREATED).body(StaffDTO.fromEntity(createdStaff));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update staff", description = "Updates an existing staff member")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully updated the staff member"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "404", description = "Staff member not found")
    })    public ResponseEntity<StaffDTO> updateStaff(@PathVariable Long id, @Valid @RequestBody Staff staff) {
        logger.info("Updating staff member with ID: {}", id);
        staff.setId(id);
        Optional<Staff> updatedStaff = staffService.updateStaff(staff);
        return updatedStaff.map(s -> ResponseEntity.ok(StaffDTO.fromEntity(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete staff", description = "Deletes a staff member")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Successfully deleted the staff member"),
            @ApiResponse(responseCode = "404", description = "Staff member not found")
    })
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        logger.info("Deleting staff member with ID: {}", id);
        boolean deleted = staffService.deleteStaff(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/bulk-upload")
    @Operation(summary = "Bulk upload staff", description = "Uploads multiple staff members at once")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully processed the bulk upload request"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })    public ResponseEntity<BulkUploadResponse> bulkUploadStaff(@Valid @RequestBody BulkStaffRequest request) {
        logger.info("Processing bulk staff upload with {} records", request.getStaff().size());
        BulkUploadResponse response = staffService.bulkUploadStaff(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload staff from CSV", description = "Uploads staff members from a CSV file")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully processed the CSV file"),
            @ApiResponse(responseCode = "400", description = "Invalid file format or content")
    })
    public ResponseEntity<BulkUploadResponse> uploadCsv(@RequestParam("file") MultipartFile file) {        logger.info("Processing staff CSV upload");
        try {
            // Direct use of parseStaffFromFile which returns core Staff objects
            List<Staff> staffList = csvXlsParser.parseStaffFromFile(file);
            
            // Process the list directly
            BulkUploadResponse response = staffService.bulkUploadStaffList(staffList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing CSV file: {}", e.getMessage(), e);            // BulkUploadResponse doesn't have success or message fields 
            BulkUploadResponse errorResponse = new BulkUploadResponse();
            List<String> errors = new ArrayList<>();
            errors.add("Error processing file: " + e.getMessage());
            errorResponse.setErrors(errors);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
