package com.school.hrm.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.school.hrm.dto.StaffDTO;
import com.school.hrm.model.EmploymentStatus;
import com.school.hrm.service.StaffService;

@RestController("schoolHrmStaffController") // Added unique bean name
@RequestMapping("/api/hrm/staff") // Changed from "/api/staff" to "/api/hrm/staff"
public class StaffController {

    private final StaffService staffService;

    @Autowired
    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public ResponseEntity<List<StaffDTO>> getAllStaff() {
        List<StaffDTO> staffList = staffService.getAllStaff();
        return ResponseEntity.ok(staffList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffDTO> getStaffById(@PathVariable Long id) {
        StaffDTO staff = staffService.getStaffById(id);
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/staff-id/{staffId}")
    public ResponseEntity<StaffDTO> getStaffByStaffId(@PathVariable String staffId) {
        StaffDTO staff = staffService.getStaffByStaffId(staffId);
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<StaffDTO> getStaffByEmail(@PathVariable String email) {
        StaffDTO staff = staffService.getStaffByEmail(email);
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/role/{roleName}")
    public ResponseEntity<List<StaffDTO>> getStaffByRole(@PathVariable String roleName) {
        List<StaffDTO> staffList = staffService.getStaffByRole(roleName);
        return ResponseEntity.ok(staffList);
    }

    @GetMapping("/active")
    public ResponseEntity<List<StaffDTO>> getActiveStaff() {
        List<StaffDTO> staffList = staffService.getActiveStaff();
        return ResponseEntity.ok(staffList);
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<StaffDTO>> getAllTeachers() {
        List<StaffDTO> teachers = staffService.getAllTeachers();
        return ResponseEntity.ok(teachers);
    }

    @GetMapping("/principals")
    public ResponseEntity<List<StaffDTO>> getAllPrincipals() {
        List<StaffDTO> principals = staffService.getAllPrincipals();
        return ResponseEntity.ok(principals);
    }

    @GetMapping("/admin-officers")
    public ResponseEntity<List<StaffDTO>> getAllAdminOfficers() {
        List<StaffDTO> adminOfficers = staffService.getAllAdminOfficers();
        return ResponseEntity.ok(adminOfficers);
    }

    @GetMapping("/management")
    public ResponseEntity<List<StaffDTO>> getAllManagementStaff() {
        List<StaffDTO> managementStaff = staffService.getAllManagementStaff();
        return ResponseEntity.ok(managementStaff);
    }

    @GetMapping("/account-officers")
    public ResponseEntity<List<StaffDTO>> getAllAccountOfficers() {
        List<StaffDTO> accountOfficers = staffService.getAllAccountOfficers();
        return ResponseEntity.ok(accountOfficers);
    }

    @GetMapping("/librarians")
    public ResponseEntity<List<StaffDTO>> getAllLibrarians() {
        List<StaffDTO> librarians = staffService.getAllLibrarians();
        return ResponseEntity.ok(librarians);
    }

    @PostMapping
    public ResponseEntity<StaffDTO> createStaff(@RequestBody StaffDTO staffDTO) {
        StaffDTO createdStaff = staffService.createStaff(staffDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStaff);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffDTO> updateStaff(@PathVariable Long id, @RequestBody StaffDTO staffDTO) {
        StaffDTO updatedStaff = staffService.updateStaff(id, staffDTO);
        return ResponseEntity.ok(updatedStaff);
    }

    /**
     * Update a staff member's employment status
     * 
     * @param id     The staff member's ID
     * @param status The new employment status
     * @return The updated staff data
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<StaffDTO> updateStaffStatus(
            @PathVariable Long id,
            @RequestParam EmploymentStatus status) {
        StaffDTO updatedStaff = staffService.updateStaffStatus(id, status);
        return ResponseEntity.ok(updatedStaff);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}