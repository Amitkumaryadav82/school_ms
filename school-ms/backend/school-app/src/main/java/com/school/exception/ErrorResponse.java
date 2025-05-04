package com.school.exception;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Standardized response object for error handling across the application.
 * Enhanced to support detailed field-level validation errors and stack traces
 * for debugging environments.
 */
@Data
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, String> errors;
    private String path;
    private String traceId;

    public ErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.errors = new HashMap<>();
    }

    /**
     * Adds a field-specific error message
     * 
     * @param field   The field name that has the error
     * @param message The error message
     */
    public void addError(String field, String message) {
        if (this.errors == null) {
            this.errors = new HashMap<>();
        }
        this.errors.put(field, message);
    }

    /**
     * Sets the entire error map
     * 
     * @param errors Map of field names to error messages
     */
    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }
}