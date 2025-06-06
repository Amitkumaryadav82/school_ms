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
     */
    public BulkUploadResponse(int created, int updated) {
        this.created = created;
        this.updated = updated;
    }
}