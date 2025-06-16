package com.school.staff.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.school.staff.model.ConsolidatedStaff;
import com.school.staff.model.EmploymentStatus;
import com.school.staff.service.ConsolidatedStaffService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Consolidated Staff controller that combines functionality from both previous implementations.
 * This combines features from:
 * - com.school.hrm.controller.StaffController
 * - com.school.staff.controller.StaffBulkController
 * 
 * NOTE: This controller is deprecated and replaced by com.school.core.controller.StaffController
 */
@org.springframework.stereotype.Component("consolidatedStaffController")
@Deprecated
@RequestMapping("/api/legacy-staff")
@Tag(name = "Staff Management", description = "APIs for managing staff information")
public class ConsolidatedStaffController {

    private final ConsolidatedStaffService staffService;

    @Autowired
    public ConsolidatedStaffController(ConsolidatedStaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    @Operation(summary = "Get all staff", description = "Returns a list of all staff members in the system")
    public ResponseEntity<List<ConsolidatedStaff>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }
    
    @GetMapping("/paginated")
    @Operation(summary = "Get paginated staff", description = "Returns a paginated list of staff members")
    public ResponseEntity<Page<ConsolidatedStaff>> getPaginatedStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lastName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                    Sort.by(sortBy).descending() : 
                    Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(staffService.getAllStaffPaginated(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get staff by ID", description = "Returns a single staff member by their ID")
    public ResponseEntity<ConsolidatedStaff> getStaffById(@PathVariable Long id) {
        try {
            ConsolidatedStaff staff = staffService.getStaffById(id);
            return ResponseEntity.ok(staff);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/staff-id/{staffId}")
    @Operation(summary = "Get staff by staff ID", description = "Returns a single staff member by their staff ID")
    public ResponseEntity<ConsolidatedStaff> getStaffByStaffId(@PathVariable String staffId) {
        try {
            ConsolidatedStaff staff = staffService.getStaffByStaffId(staffId);
            return ResponseEntity.ok(staff);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get staff by email", description = "Returns a single staff member by their email address")
    public ResponseEntity<ConsolidatedStaff> getStaffByEmail(@PathVariable String email) {
        try {
            ConsolidatedStaff staff = staffService.getStaffByEmail(email);
            return ResponseEntity.ok(staff);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/role/{roleName}")
    @Operation(summary = "Get staff by role", description = "Returns all staff members with a specific role")
    public ResponseEntity<List<ConsolidatedStaff>> getStaffByRole(@PathVariable String roleName) {
        try {
            List<ConsolidatedStaff> staffList = staffService.getStaffByRoleName(roleName);
            return ResponseEntity.ok(staffList);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/active")
    @Operation(summary = "Get active staff", description = "Returns all active staff members")
    public ResponseEntity<List<ConsolidatedStaff>> getActiveStaff() {
        return ResponseEntity.ok(staffService.getActiveStaff());
    }

    @GetMapping("/teachers")
    @Operation(summary = "Get all teachers", description = "Returns all staff members with the role 'TEACHER'")
    public ResponseEntity<List<ConsolidatedStaff>> getAllTeachers() {
        return ResponseEntity.ok(staffService.getAllTeachers());
    }

    @GetMapping("/search")
    @Operation(summary = "Search staff by name", description = "Returns staff members whose names match the search query")
    public ResponseEntity<List<ConsolidatedStaff>> searchStaff(@RequestParam String query) {
        return ResponseEntity.ok(staffService.searchStaffByName(query));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create new staff member", description = "Creates a new staff member in the system")
    public ResponseEntity<ConsolidatedStaff> createStaff(@Valid @RequestBody ConsolidatedStaff staff) {
        ConsolidatedStaff createdStaff = staffService.createStaff(staff);
        return new ResponseEntity<>(createdStaff, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update staff member", description = "Updates an existing staff member by their ID")
    public ResponseEntity<ConsolidatedStaff> updateStaff(@PathVariable Long id, @Valid @RequestBody ConsolidatedStaff staff) {
        try {
            ConsolidatedStaff updatedStaff = staffService.updateStaff(id, staff);
            return ResponseEntity.ok(updatedStaff);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update staff status", description = "Updates a staff member's employment status")
    public ResponseEntity<ConsolidatedStaff> updateStaffStatus(
            @PathVariable Long id,
            @RequestParam EmploymentStatus status) {
        try {
            ConsolidatedStaff updatedStaff = staffService.updateStaffStatus(id, status);
            return ResponseEntity.ok(updatedStaff);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Activate staff member", description = "Activates a staff member")
    public ResponseEntity<ConsolidatedStaff> activateStaff(@PathVariable Long id) {
        try {
            ConsolidatedStaff activatedStaff = staffService.activateStaff(id);
            return ResponseEntity.ok(activatedStaff);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Deactivate staff member", description = "Deactivates a staff member")
    public ResponseEntity<ConsolidatedStaff> deactivateStaff(@PathVariable Long id) {
        try {
            ConsolidatedStaff deactivatedStaff = staffService.deactivateStaff(id);
            return ResponseEntity.ok(deactivatedStaff);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete staff member", description = "Deletes a staff member from the system")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        try {
            staffService.deleteStaff(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Bulk create staff", description = "Creates multiple staff members at once")
    public ResponseEntity<List<ConsolidatedStaff>> bulkCreateStaff(
            @Valid @RequestBody List<ConsolidatedStaff> staffList) {
        List<ConsolidatedStaff> createdStaff = staffService.bulkCreateStaff(staffList);
        return new ResponseEntity<>(createdStaff, HttpStatus.CREATED);
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Get staff statistics", description = "Returns statistics about staff in the system")
    public ResponseEntity<Map<String, Object>> getStaffStats() {
        List<ConsolidatedStaff> allStaff = staffService.getAllStaff();
        
        // Calculate stats
        int totalStaff = allStaff.size();
        int activeStaff = (int) allStaff.stream().filter(s -> s.getIsActive()).count();
        int inactiveStaff = totalStaff - activeStaff;
        
        Map<String, Long> roleDistribution = allStaff.stream()
            .collect(Collectors.groupingBy(
                ConsolidatedStaff::getRoleName,
                Collectors.counting()
            ));
        
        Map<String, Long> statusDistribution = allStaff.stream()
            .collect(Collectors.groupingBy(
                s -> s.getEmploymentStatus().toString(),
                Collectors.counting()
            ));
        
        // Create response
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStaff", totalStaff);
        stats.put("activeStaff", activeStaff);
        stats.put("inactiveStaff", inactiveStaff);
        stats.put("roleDistribution", roleDistribution);
        stats.put("statusDistribution", statusDistribution);
        
        return ResponseEntity.ok(stats);
    }
}
