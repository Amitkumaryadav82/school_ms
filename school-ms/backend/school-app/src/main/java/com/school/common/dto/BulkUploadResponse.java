package com.school.common.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for the response of bulk upload operations.
 * This is a consolidated version migrated from com.example.schoolms.dto.BulkUploadResponse
 */
@Data
public class BulkUploadResponse {
    private int created = 0;
    private int updated = 0;
    private int successCount = 0;
    private int failureCount = 0;
    private List<String> errors = new ArrayList<>();
    
    /**
     * No-args constructor
     */
    public BulkUploadResponse() {
        // Default values are already set above
    }
    
    /**
     * Constructor with created and updated counts, empty errors list
     */
    public BulkUploadResponse(int created, int updated) {
        this.created = created;
        this.updated = updated;
    }
      /**
     * Constructor with created, updated, and errors
     */
    public BulkUploadResponse(int created, int updated, List<String> errors) {
        this.created = created;
        this.updated = updated;
        this.errors = errors;
    }
      // Removed duplicate constructors that conflict with the ones above
    
    /**
     * Gets the created count
     * @return number of created records
     */
    public int getCreated() {
        return this.created;
    }
    
    /**
     * Sets the created count
     * @param created number of created records
     */
    public void setCreated(int created) {
        this.created = created;
    }
    
    /**
     * Gets the updated count
     * @return number of updated records
     */
    public int getUpdated() {
        return this.updated;
    }
    
    /**
     * Sets the updated count
     * @param updated number of updated records
     */
    public void setUpdated(int updated) {
        this.updated = updated;
    }
    
    /**
     * Gets the success count
     * @return number of successful operations
     */
    public int getSuccessCount() {
        return this.successCount;
    }
    
    /**
     * Sets the success count
     * @param successCount number of successful operations
     */
    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }
    
    /**
     * Gets the failure count
     * @return number of failed operations
     */
    public int getFailureCount() {
        return this.failureCount;
    }
    
    /**
     * Sets the failure count
     * @param failureCount number of failed operations
     */
    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }
    
    /**
     * Gets the errors list
     * @return list of error messages
     */
    public List<String> getErrors() {
        return this.errors;
    }
    
    /**
     * Sets the errors list
     * @param errors list of error messages
     */
    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
}
