package com.school.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for ExamType enum
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamTypeDto {
    private String name;
    private String displayName;
}
