package com.school.hrm.controller;

import com.school.hrm.dto.EmployeeDTO;
import com.school.hrm.model.EmployeeRole;
import com.school.hrm.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employee Management", description = "APIs for managing school employees")
@SecurityRequirement(name = "bearerAuth")
public class EmployeeController {
    private final EmployeeService employeeService;

    @Operation(summary = "Create new employee", description = "Creates a new employee record")
    @ApiResponse(responseCode = "200", description = "Employee created successfully")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeDTO> createEmployee(@Valid @RequestBody EmployeeDTO employeeDTO) {
        return ResponseEntity.ok(employeeService.createEmployee(employeeDTO));
    }

    @Operation(summary = "Update employee", description = "Updates an existing employee record")
    @ApiResponse(responseCode = "200", description = "Employee updated successfully")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeDTO> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeDTO employeeDTO) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employeeDTO));
    }

    @Operation(summary = "Get employee", description = "Retrieves an employee by ID")
    @ApiResponse(responseCode = "200", description = "Employee found")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<EmployeeDTO> getEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployee(id));
    }

    @Operation(summary = "Get all employees", description = "Retrieves all employees")
    @ApiResponse(responseCode = "200", description = "Employees retrieved successfully")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @Operation(summary = "Get employees by department", description = "Retrieves employees in a specific department")
    @ApiResponse(responseCode = "200", description = "Employees retrieved successfully")
    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<EmployeeDTO>> getEmployeesByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(employeeService.getEmployeesByDepartment(department));
    }

    @Operation(summary = "Get employees by role", description = "Retrieves employees with a specific role")
    @ApiResponse(responseCode = "200", description = "Employees retrieved successfully")
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<EmployeeDTO>> getEmployeesByRole(@PathVariable EmployeeRole role) {
        return ResponseEntity.ok(employeeService.getEmployeesByRole(role));
    }

    @Operation(summary = "Delete employee", description = "Deletes an employee record")
    @ApiResponse(responseCode = "200", description = "Employee deleted successfully")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }
}