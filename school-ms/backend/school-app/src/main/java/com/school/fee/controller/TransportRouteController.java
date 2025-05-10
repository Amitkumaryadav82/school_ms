package com.school.fee.controller;

import com.school.fee.dto.TransportRouteDTO;
import com.school.fee.service.TransportRouteService;
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
@RequestMapping("/api/fees/transport-routes")
@RequiredArgsConstructor
@Tag(name = "Transport Route Management", description = "APIs for managing transport routes and fees")
public class TransportRouteController {

    private final TransportRouteService transportRouteService;

    @Operation(summary = "Get all transport routes", description = "Retrieves all transport routes defined in the system")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransportRouteDTO>> getAllTransportRoutes() {
        return ResponseEntity.ok(transportRouteService.getAllTransportRoutes());
    }

    @Operation(summary = "Get transport route by ID", description = "Retrieves a specific transport route by its ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransportRouteDTO> getTransportRouteById(@PathVariable Long id) {
        return ResponseEntity.ok(transportRouteService.getTransportRouteById(id));
    }

    @Operation(summary = "Get transport route by name", description = "Retrieves a transport route by its name")
    @GetMapping("/name/{routeName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransportRouteDTO> getTransportRouteByName(@PathVariable String routeName) {
        return ResponseEntity.ok(transportRouteService.getTransportRouteByName(routeName));
    }

    @Operation(summary = "Create new transport route", description = "Creates a new transport route with fee")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransportRouteDTO> createTransportRoute(
            @Valid @RequestBody TransportRouteDTO transportRouteDTO) {
        return new ResponseEntity<>(transportRouteService.createTransportRoute(transportRouteDTO), HttpStatus.CREATED);
    }

    @Operation(summary = "Update transport route", description = "Updates an existing transport route")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransportRouteDTO> updateTransportRoute(@PathVariable Long id,
            @Valid @RequestBody TransportRouteDTO transportRouteDTO) {
        return ResponseEntity.ok(transportRouteService.updateTransportRoute(id, transportRouteDTO));
    }

    @Operation(summary = "Delete transport route", description = "Deletes a transport route")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTransportRoute(@PathVariable Long id) {
        transportRouteService.deleteTransportRoute(id);
        return ResponseEntity.noContent().build();
    }
}