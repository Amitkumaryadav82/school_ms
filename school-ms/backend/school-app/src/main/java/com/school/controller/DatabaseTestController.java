package com.school.controller;

import com.school.service.PostgreSQLHttpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class DatabaseTestController {
    
    @Autowired
    private PostgreSQLHttpService postgreSQLHttpService;
    
    @GetMapping("/connection")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean isConnected = postgreSQLHttpService.testConnection();
            response.put("connected", isConnected);
            response.put("message", isConnected ? "Successfully connected to PostgreSQL via HTTP" : "Failed to connect");
            
            // Add configuration info for debugging
            response.put("postgrest_url", postgreSQLHttpService.getPostgrestBaseUrl());
            
        } catch (Exception e) {
            response.put("connected", false);
            response.put("message", "Error testing connection: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/tables/{tableName}")
    public ResponseEntity<List<Map<String, Object>>> getTableData(@PathVariable String tableName) {
        try {
            List<Map<String, Object>> data = postgreSQLHttpService.select(tableName, null);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/tables/{tableName}/filtered")
    public ResponseEntity<List<Map<String, Object>>> getFilteredTableData(
            @PathVariable String tableName, 
            @RequestParam String filter) {
        try {
            List<Map<String, Object>> data = postgreSQLHttpService.select(tableName, filter);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
