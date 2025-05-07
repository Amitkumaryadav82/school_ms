package com.example.schoolms.dto;

import com.example.schoolms.model.Staff;
import java.util.List;

public class BulkUploadResponse {
    private int created;
    private int updated;
    private List<String> errors;

    // Constructor with counts and errors
    public BulkUploadResponse(int created, int updated, List<String> errors) {
        this.created = created;
        this.updated = updated;
        this.errors = errors;
    }

    // Constructor with staff lists
    public BulkUploadResponse(List<Staff> createdStaff, List<Staff> updatedStaff, List<Staff> failedStaff) {
        this.created = createdStaff.size();
        this.updated = updatedStaff.size();
        this.errors = failedStaff.stream()
                .map(staff -> "Failed to process: " + staff.getEmail())
                .toList();
    }

    // Getters and setters
    public int getCreated() {
        return created;
    }

    public void setCreated(int created) {
        this.created = created;
    }

    public int getUpdated() {
        return updated;
    }

    public void setUpdated(int updated) {
        this.updated = updated;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
}