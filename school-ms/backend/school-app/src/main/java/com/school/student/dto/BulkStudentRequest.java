package com.school.student.dto;

import com.school.student.model.Student;
import lombok.Data;
import jakarta.validation.Valid;
import java.util.List;

@Data
public class BulkStudentRequest {
    @Valid
    private List<Student> students;

    // Summary information for validation
    private Integer expectedCount;
}