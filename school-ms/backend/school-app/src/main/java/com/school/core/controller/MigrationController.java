package com.school.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for monitoring and managing the staff data migration process.
 * This controller provides endpoints to check migration status and trigger
 * manual migration.
 */
@RestController
@RequestMapping("/api/admin/migration")
@Tag(name = "Staff Migration", description = "APIs for monitoring and managing staff data migration")
public class MigrationController {

    // Legacy migration service removed; endpoints now return static status.

    /**
     * Gets the current status of staff data migration.
     * 
     * @return A response with the migration status
     */
    @GetMapping("/staff/status")
    @Operation(summary = "Get staff migration status", description = "Returns the current status of the staff data migration process")
    public ResponseEntity<Map<String, Object>> getStaffMigrationStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "Staff migration completed; legacy staff table and code removed");
        status.put("isComplete", true);
        return ResponseEntity.ok(status);
    }

    /**
     * Triggers a manual migration of staff data.
     * 
     * @return A response with the migration result
     */
    @PostMapping("/staff/trigger")
    @Operation(summary = "Trigger staff migration", description = "Manually triggers the staff data migration process")
    public ResponseEntity<Map<String, Object>> triggerStaffMigration() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", "Migration disabled: legacy staff code removed; no action needed.");
        return ResponseEntity.ok(result);
    }
}
