package com.example.schoolms.dto;

import java.util.List;

import com.example.schoolms.model.Staff;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for bulk staff creation or update requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkStaffRequest {
    private List<Staff> staff;
    private Integer expectedCount;
}