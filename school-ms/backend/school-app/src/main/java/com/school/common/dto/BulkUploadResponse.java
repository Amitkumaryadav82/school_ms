package com.school.common.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for the response of bulk upload operations.
 * This is a consolidated version migrated from com.example.schoolms.dto.BulkUploadResponse
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
