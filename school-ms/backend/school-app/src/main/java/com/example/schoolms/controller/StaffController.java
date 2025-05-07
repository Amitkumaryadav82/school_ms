package com.example.schoolms.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.schoolms.dto.BulkUploadResponse;
import com.example.schoolms.model.Staff;
import com.example.schoolms.service.StaffService;
import com.example.schoolms.util.CsvXlsParser;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private static final Logger logger = LoggerFactory.getLogger(StaffController.class);

    @Autowired
    private StaffService staffService;

    @Autowired
    private CsvXlsParser csvXlsParser;

    // Get all staff
    @GetMapping
    public ResponseEntity<List<Staff>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    // Get staff by ID
    @GetMapping("/{id}")
    public ResponseEntity<Staff> getStaffById(@PathVariable Long id) {
        Optional<Staff> staff = staffService.getStaffById(id);
        return staff.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new staff
    @PostMapping
    public ResponseEntity<Staff> createStaff(@RequestBody Staff staff) {
        Staff savedStaff = staffService.createStaff(staff);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedStaff);
    }

    // Update staff
    @PutMapping("/{id}")
    public ResponseEntity<Staff> updateStaff(@PathVariable Long id, @RequestBody Staff staff) {
        Optional<Staff> updatedStaff = staffService.updateStaff(id, staff);
        return updatedStaff.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete staff
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        boolean deleted = staffService.deleteStaff(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Filter staff by role
    @GetMapping("/filter/role/{role}")
    public ResponseEntity<List<Staff>> getStaffByRole(@PathVariable String role) {
        List<Staff> staffList = staffService.findByRole(role);
        return ResponseEntity.ok(staffList);
    }

    // Filter staff by active status
    @GetMapping("/filter/active/{active}")
    public ResponseEntity<List<Staff>> getStaffByActiveStatus(@PathVariable boolean active) {
        List<Staff> staffList = staffService.findByIsActive(active);
        return ResponseEntity.ok(staffList);
    }

    // Bulk import staff from CSV/XLS (original endpoint)
    @PostMapping("/bulk-import")
    public ResponseEntity<BulkUploadResponse> bulkImportStaff(@RequestParam("file") MultipartFile file) {
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

    // Additional endpoint at /bulk to match frontend URL
    @PostMapping("/bulk")
    public ResponseEntity<BulkUploadResponse> bulkImportStaffAlternate(@RequestParam("file") MultipartFile file) {
        logger.info("Received bulk staff upload request at /bulk endpoint");
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

    // New endpoint to handle JSON array data for bulk staff import with better error handling
    @PostMapping(value = "/bulk", consumes = "application/json")
    public ResponseEntity<BulkUploadResponse> bulkImportStaffJson(@RequestBody List<Object> staffDataList) {
        logger.info("Received bulk staff upload request with JSON data. Staff count: " + staffDataList.size());
        
        try {
            List<Staff> processedStaffList = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            
            for (int i = 0; i < staffDataList.size(); i++) {
                try {
                    Object staffData = staffDataList.get(i);
                    logger.debug("Processing staff entry " + (i + 1) + ": " + staffData);
                    
                    Staff staff = new Staff();
                    
                    // Using a safe cast approach with instanceof checks
                    if (staffData instanceof java.util.Map) {
                        java.util.Map<?, ?> staffMap = (java.util.Map<?, ?>) staffData;
                        
                        // Set fields with proper type conversion
                        if (staffMap.get("staffId") != null) staff.setStaffId(String.valueOf(staffMap.get("staffId")));
                        if (staffMap.get("firstName") != null) staff.setFirstName(String.valueOf(staffMap.get("firstName")));
                        if (staffMap.get("lastName") != null) staff.setLastName(String.valueOf(staffMap.get("lastName")));
                        if (staffMap.get("email") != null) staff.setEmail(String.valueOf(staffMap.get("email")));
                        if (staffMap.get("role") != null) staff.setRole(String.valueOf(staffMap.get("role")));
                        if (staffMap.get("phone") != null) staff.setPhone(String.valueOf(staffMap.get("phone")));
                        if (staffMap.get("phoneNumber") != null) staff.setPhoneNumber(String.valueOf(staffMap.get("phoneNumber")));
                        if (staffMap.get("address") != null) staff.setAddress(String.valueOf(staffMap.get("address")));
                        if (staffMap.get("department") != null) staff.setDepartment(String.valueOf(staffMap.get("department")));
                        
                        // Handle date fields - check for both frontend and backend field names
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
                    new BulkUploadResponse(0, 0, errors.isEmpty() ? 
                        List.of("No valid staff entries found") : errors)
                );
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