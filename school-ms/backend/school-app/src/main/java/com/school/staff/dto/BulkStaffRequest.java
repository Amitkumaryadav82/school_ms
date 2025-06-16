package com.school.staff.dto;

import java.util.List;

import com.school.staff.model.Staff;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for bulk staff creation or update requests.
 * This is a consolidated version migrated from com.example.schoolms.dto.BulkStaffRequest
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkStaffRequest {
    private List<Staff> staff;
    private Integer expectedCount;
}
