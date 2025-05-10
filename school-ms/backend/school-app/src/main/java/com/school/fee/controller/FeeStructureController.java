package com.school.fee.controller;

import com.school.fee.dto.FeeStructureDTO;
import com.school.fee.dto.LateFeeDTO;
import com.school.fee.dto.PaymentScheduleDTO;
import com.school.fee.service.FeeStructureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees/structures")
@RequiredArgsConstructor
@Tag(name = "Fee Structure Management", description = "APIs for managing fee structures for different classes")
public class FeeStructureController {

    private final FeeStructureService feeStructureService;

    @Operation(summary = "Get all fee structures", description = "Retrieves all fee structures defined in the system")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeeStructureDTO>> getAllFeeStructures() {
        return ResponseEntity.ok(feeStructureService.getAllFeeStructures());
    }

    @Operation(summary = "Get fee structure by ID", description = "Retrieves a specific fee structure by its ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeStructureDTO> getFeeStructureById(@PathVariable Long id) {
        return ResponseEntity.ok(feeStructureService.getFeeStructureById(id));
    }

    @Operation(summary = "Get fee structure by class grade", description = "Retrieves the fee structure for a specific class grade")
    @GetMapping("/grade/{classGrade}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeStructureDTO> getFeeStructureByGrade(@PathVariable Integer classGrade) {
        return ResponseEntity.ok(feeStructureService.getFeeStructureByGrade(classGrade));
    }

    @Operation(summary = "Create new fee structure", description = "Creates a new fee structure for a class grade")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeStructureDTO> createFeeStructure(@Valid @RequestBody FeeStructureDTO feeStructureDTO) {
        return new ResponseEntity<>(feeStructureService.createFeeStructure(feeStructureDTO), HttpStatus.CREATED);
    }

    @Operation(summary = "Update fee structure", description = "Updates an existing fee structure")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeStructureDTO> updateFeeStructure(@PathVariable Long id,
            @Valid @RequestBody FeeStructureDTO feeStructureDTO) {
        return ResponseEntity.ok(feeStructureService.updateFeeStructure(id, feeStructureDTO));
    }

    @Operation(summary = "Delete fee structure", description = "Deletes a fee structure")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeeStructure(@PathVariable Long id) {
        feeStructureService.deleteFeeStructure(id);
        return ResponseEntity.noContent().build();
    }
}