package com.example.schoolms.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for the response of bulk upload operations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadResponse {
    private int created = 0;
    private int updated = 0;
    private List<String> errors = new ArrayList<>();

    /**
     * Constructor with created and updated counts, empty errors list
     */    public BulkUploadResponse(int created, int updated) {
        this.created = created;
        this.updated = updated;
        this.errors = new ArrayList<>();
    }
    
    // Explicit setters/getters in case Lombok fails
    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
    
    public List<String> getErrors() {
        return this.errors;
    }
    
    public int getCreated() {
        return this.created;
    }
    
    public int getUpdated() {
        return this.updated;
    }
    
    public void setCreated(int created) {
        this.created = created;
    }
    
    public void setUpdated(int updated) {
        this.updated = updated;
    }
}